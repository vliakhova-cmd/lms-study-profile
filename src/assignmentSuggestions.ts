import { SITE_DOA, TEMPLATE_DOCUMENT, TRAINING_MATRIX } from './doaData';
import { LibraryItem, planCourseNames } from './libraryData';

// Suggested Site & Roles.
//
// Nothing is invented here. A course's audience is already implied by what the
// study holds:
//
//   · the DOA Log Template fixes the standard duty list, and each site's
//     signed log says which ROLES at that site carry each duty
//   · the Training Requirements Matrix says which course qualifies which duty
//   · the course itself — its name and the documents it was built from — says
//     whether it is study-wide or belongs to one site
//
// Put together they answer two questions: WHO should be assigned this course
// (every site/role pair carrying a duty it qualifies), and what RULE to write
// it as — "All Sites" when every site needs it, named sites when only some do.

/** One proposed audience: a role at a site, and the duty that put it there. */
export interface SuggestedPair {
  site: string;
  role: string;
  /** Why this pair is proposed — the delegated duty the course qualifies. */
  duty: string;
}

/**
 * The rule the accepted pairs add up to. "All" is not a shorthand for "every
 * one of them happens to be ticked" — it is the statement that the course
 * applies study-wide, so a site added later is covered without anyone
 * revisiting this. Naming sites instead is the narrower, deliberate claim.
 */
export interface SuggestedRule {
  sites: 'All' | string[];
  roles: 'All' | string[];
  /** Plain-language why, shown beside the rule so it can be argued with. */
  reasons: string[];
}

export interface CourseSuggestion {
  item: LibraryItem;
  pairs: SuggestedPair[];
  /** The rule if every proposed pair is accepted. */
  rule: SuggestedRule;
}

/**
 * The documents a course was built from, as the duties that name it record
 * them — "Protocol §10.1", "Pharmacy Manual v2.1", "Site 2208 Pharmacy
 * Addendum". They are the strongest hint about scope: a protocol section
 * applies to the whole study, a site addendum does not.
 */
export function sourcesFor(item: LibraryItem): string[] {
  const names = item.courses != null ? planCourseNames(item.id) : [item.name];
  const out = new Set<string>();
  for (const { duties } of SITE_DOA) {
    for (const duty of duties) {
      for (const course of duty.courses) {
        if (names.includes(course.name) && course.source) out.add(course.source);
      }
    }
  }
  return [...out];
}

/** Every site the study holds a DOA log for. */
const ALL_SITES = SITE_DOA.map(d => d.site.label);

/** Every role delegated anywhere in the study. */
const ALL_ROLES = [...new Set(SITE_DOA.flatMap(d => d.duties.flatMap(duty => duty.roles)))];

/** Every site/role that carries a duty one of these courses qualifies. */
function pairsForCourses(names: string[]): SuggestedPair[] {
  const out: SuggestedPair[] = [];
  for (const { site, duties } of SITE_DOA) {
    for (const duty of duties) {
      if (!duty.courses.some(c => names.includes(c.name))) continue;
      for (const role of duty.roles) {
        // The same role can carry two duties the course qualifies; it is still
        // one audience, so the first duty that put it there is the reason kept.
        if (out.some(p => p.site === site.label && p.role === role)) continue;
        out.push({ site: site.label, role, duty: duty.name });
      }
    }
  }
  return out;
}

export function suggestionsFor(item: LibraryItem): SuggestedPair[] {
  return pairsForCourses(item.courses != null ? planCourseNames(item.id) : [item.name]);
}

/**
 * A course that names a site in its title, or was built from that site's own
 * documents, belongs to that site however many others carry the duty — a local
 * pharmacy addendum does not become study-wide because other sites dispense IP.
 */
function siteNamedIn(item: LibraryItem): string | null {
  const haystack = item.name.toLowerCase();
  const named = SITE_DOA.find(d => haystack.includes(d.site.number) || haystack.includes(d.site.pi.toLowerCase()));
  return named ? named.site.label : null;
}

/**
 * The rule a set of pairs adds up to. Computed from whatever is ACCEPTED, so
 * unticking one site's row turns "All Sites" into the named sites that remain —
 * the rule follows the decision rather than the proposal.
 */
export function ruleFromPairs(item: LibraryItem, pairs: SuggestedPair[]): SuggestedRule {
  const sites = [...new Set(pairs.map(p => p.site))];
  const roles = [...new Set(pairs.map(p => p.role))];
  const reasons: string[] = [];

  const local = siteNamedIn(item);
  const sources = sourcesFor(item);
  // Say what it was read from before saying what it concluded.
  if (sources.length > 0) reasons.push(`Built from ${sources.slice(0, 2).join(' · ')}`);
  const siteRule: 'All' | string[] =
    local && sites.includes(local) && sites.length === 1
      ? [local]
      : sites.length === ALL_SITES.length
      ? 'All'
      : sites;

  if (local && sites.length === 1) reasons.push(`Names ${local} in its title, so it stays with that site`);
  else if (siteRule === 'All') reasons.push('Every site delegates a duty this course qualifies');
  else if (sites.length > 0) reasons.push(`Only ${sites.length} of ${ALL_SITES.length} sites delegate it`);

  const roleRule: 'All' | string[] = roles.length === ALL_ROLES.length ? 'All' : roles;
  if (roleRule === 'All') reasons.push('Carried by every delegated role');
  else if (roles.length === 1) reasons.push(`Only the ${roles[0]} carries it`);
  else if (roles.length > 0) reasons.push(`Carried by ${roles.length} of the ${ALL_ROLES.length} delegated roles`);

  const duties = [...new Set(pairs.map(p => p.duty))];
  if (duties.length > 0) {
    reasons.push(duties.length === 1 ? `Qualifies "${duties[0]}"` : `Qualifies ${duties.length} delegated duties`);
  }

  return { sites: siteRule, roles: roleRule, reasons };
}

/** "All Sites AND 3 Roles" — how the grid will read once the rule is applied. */
export function describeRule(rule: SuggestedRule): string {
  const sites = rule.sites === 'All' ? 'All Sites' : `${rule.sites.length} ${rule.sites.length === 1 ? 'Site' : 'Sites'}`;
  const roles = rule.roles === 'All' ? 'All Roles' : `${rule.roles.length} ${rule.roles.length === 1 ? 'Role' : 'Roles'}`;
  return `${sites} AND ${roles}`;
}

/**
 * Whether a course is still open to a proposal: only one with NO audience yet.
 * An assignment that has been set is a decision somebody made — a draft's just
 * as much as a published course's — and the system does not argue with it. The
 * suggestion fills a blank; it never offers to overwrite an answer.
 */
export function acceptsSuggestion(item: LibraryItem): boolean {
  return item.assignment.kind === 'none';
}

/**
 * What the review dialog lists. Two exclusions: courses that already have an
 * audience, which are settled, and courses no delegated duty stands behind —
 * there is nothing to derive an audience from, and an empty proposal is worse
 * than none.
 */
export function suggestAssignments(items: LibraryItem[]): CourseSuggestion[] {
  return items
    .filter(acceptsSuggestion)
    .map(item => {
      const pairs = suggestionsFor(item);
      return { item, pairs, rule: ruleFromPairs(item, pairs) };
    })
    .filter(s => s.pairs.length > 0);
}


/**
 * One row of the Assignment Rules grid: a site — or every site at once — and
 * the roles mapped there. GL | PROD | 2.7's Sites & Roles wizard writes a rule
 * this way round (site, then its roles) rather than as a flat list of pairs,
 * and it reads better: a role that every site carries becomes ONE "All Sites"
 * row instead of the same name repeated down the grid.
 */
export interface AssignmentRow {
  /** 'All Sites' on the study-wide row, otherwise the site's label. */
  site: string;
  allSites: boolean;
  roles: string[];
  /** The duties those roles carry — the row's reason, shown on hover. */
  duties: string[];
}

export const ALL_SITES_LABEL = 'All Sites';

/**
 * Pairs folded into rules. A role carried at EVERY site is study-wide, so it
 * lifts out into the All Sites row; what is left over stays with the site that
 * has it. That is the "mixed" rule the pattern shows — a study-wide row plus
 * the site-specific additions — and it falls out of the data rather than being
 * a mode anyone has to pick.
 */
export function rowsFromPairs(pairs: SuggestedPair[]): AssignmentRow[] {
  const sites = [...new Set(pairs.map(p => p.site))];
  const rolesAt = (site: string) => pairs.filter(p => p.site === site).map(p => p.role);
  const dutiesFor = (site: string, roles: string[]) => [
    ...new Set(pairs.filter(p => (site === ALL_SITES_LABEL || p.site === site) && roles.includes(p.role)).map(p => p.duty)),
  ];

  // Only a course that reaches every site can have a study-wide row at all.
  const shared =
    sites.length === ALL_SITES.length ? [...new Set(pairs.map(p => p.role))].filter(r => sites.every(s => rolesAt(s).includes(r))) : [];

  const rows: AssignmentRow[] = [];
  if (shared.length > 0) rows.push({ site: ALL_SITES_LABEL, allSites: true, roles: shared, duties: dutiesFor(ALL_SITES_LABEL, shared) });

  for (const site of sites) {
    const rest = [...new Set(rolesAt(site))].filter(r => !shared.includes(r));
    if (rest.length > 0) rows.push({ site, allSites: false, roles: rest, duties: dutiesFor(site, rest) });
  }
  return rows;
}

/** Every site the study holds a log for — what "All Sites" stands for. */
export const SUGGESTION_SITES = ALL_SITES;

/** The documents the proposal is derived from, for the dialog to cite. */
export const SUGGESTION_SOURCES = [
  `${TEMPLATE_DOCUMENT.name} ${TEMPLATE_DOCUMENT.version}`,
  `${TRAINING_MATRIX.name} ${TRAINING_MATRIX.version}`,
];
