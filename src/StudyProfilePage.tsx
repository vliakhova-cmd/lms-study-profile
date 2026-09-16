import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import TopHeaderBar from './appShell/TopHeaderBar';
import LeftIconNav from './appShell/LeftIconNav';
import CollapsiblePanel from './appShell/CollapsiblePanel';
import StudySidebar, { STUDY_ITEMS, SECTION_LABELS, type SectionId } from './StudySidebar';
import LearnerTree from './LearnerTree';
import TrainingToolbar, { trainingPlansActions, sitesActions, doaActions, libraryActions } from './TrainingToolbar';
import FilterRow, { TRAINING_PLANS_FILTERS, SITES_FILTERS, DOA_FILTERS, LIBRARY_FILTERS } from './FilterRow';
import ViewTabs from './ViewTabs';
import CourseTable from './CourseTable';
import SitesTable from './SitesTable';
import LibraryTable, { LIBRARY_VIEWS, SuggestionBanner, type LibraryView } from './LibraryTable';
import DoaSection, { DoaHeaderLinks } from './DoaSection';
import SuggestAssignmentDialog from './SuggestAssignmentDialog';
import TrainingGapsDialog from './TrainingGapsDialog';
import { COURSE_COUNT } from './coursesData';
import { SITE_COUNT } from './sitesData';
import { peopleNotEnrolled, sitesWithGaps } from './personnelData';
import { COURSE_TOTAL, PLAN_TOTAL, LIBRARY_COURSES, type LibraryItem } from './libraryData';
import { siteUrl, userUrl, authoringUrl, siteNumberOf, go } from './links';
import { color, type, tree, page, subNav, pageHeader, sysMsg, icon, button as btn } from './tokens';

// The STUDY profile — the study's own screen, its own app and its own repo.
//
// A site and a user are separate apps: clicking a site name or a person's name
// navigates to them rather than swapping this page's contents. What stays here
// is what the STUDY owns — its catalogue, the duty → course mapping, its list
// of sites — and the two things it links out to that are not levels at all:
// the eTMF that holds the signed logs, and the authoring flow that writes
// courses.

/** ?section= — which section to open on. */
function requestedSection(): SectionId {
  const asked = new URLSearchParams(window.location.search).get('section') ?? '';
  return asked in SECTION_LABELS ? (asked as SectionId) : 'training-plans';
}

export function StudyProfilePage() {
  const [section, setSection] = useState<SectionId>(requestedSection);
  const [coursesSelected, setCoursesSelected] = useState(0);
  const [sitesSelected, setSitesSelected] = useState(0);
  const [librarySelected, setLibrarySelected] = useState(0);
  const [libraryView, setLibraryView] = useState<LibraryView>('Courses');

  // A course authored in the authoring app is created in THIS study's library,
  // so the listing's rows live here rather than being read straight from the
  // module. (The authoring app is a separate app now, so it returns here by
  // URL rather than closing an overlay.)
  const [courses, setCourses] = useState<LibraryItem[]>(LIBRARY_COURSES);
  const [suggesting, setSuggesting] = useState(false);
  const [showingGaps, setShowingGaps] = useState(false);
  // Gaps closed by enrolling someone from the dialog, so the banner stops
  // counting what has just been fixed.
  const [closedGaps, setClosedGaps] = useState<Set<string>>(new Set());

  const gapPeople = peopleNotEnrolled(undefined, closedGaps);
  const gapSites = sitesWithGaps(closedGaps);

  const isSites = section === 'sites';
  const isDoa = section === 'doa';
  const isLibrary = section === 'training-library';
  const isPlans = section === 'training-plans';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: color.pageBg,
        fontFamily: type.body.fontFamily,
      }}
    >
      <TopHeaderBar
        crumbs={[
          { label: 'Company Dashboard', value: 'Manage Studies & Sites', onClick: () => setSection('sites') },
          { label: 'Studies', value: 'Bivivid', onClick: () => setSection('general-info') },
          { value: SECTION_LABELS[section], isEnd: true },
        ]}
        avatarInitials="SL"
        role="S. Admin"
        notifCount={2}
      />

      <div style={{ display: 'flex', flex: '1 0 0', minHeight: 0 }}>
        <LeftIconNav />

        {/* navigation-sub is pinned at its width — only the tree resizes */}
        <CollapsiblePanel defaultWidth={subNav.width}>
          <StudySidebar
            name="Bivivid"
            level="STUDY"
            statusLabel="Active"
            info={[
              { label: 'Study', value: 'Bivivid' },
              { label: 'Business Unit', value: 'Surgical' },
            ]}
            items={STUDY_ITEMS}
            selected={section}
            onSelect={id => setSection(id as SectionId)}
          />
        </CollapsiblePanel>

        <div style={{ display: 'flex', flexDirection: 'column', flex: '1 0 0', minWidth: 0, minHeight: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: pageHeader.gapM,
              padding: `${pageHeader.paddingY}px ${pageHeader.paddingX}px`,
              backgroundColor: color.pageHeaderBg,
              flexShrink: 0,
              minWidth: 0,
            }}
          >
            <h1 style={{ margin: 0, ...type.h1, color: color.pageHeaderText, flexShrink: 0 }}>{SECTION_LABELS[section]}</h1>
            {isPlans && <ViewTabs />}
            {/* The library is listed either as courses or as the plans that bundle them */}
            {isLibrary && (
              <ViewTabs
                tabs={LIBRARY_VIEWS}
                value={libraryView}
                onChange={v => {
                  setLibraryView(v as LibraryView);
                  // The table remounts on the view, so its selection goes with it.
                  setLibrarySelected(0);
                }}
              />
            )}
            {/* The tasks are generated, so the header carries their sources */}
            {isDoa && <DoaHeaderLinks />}
          </div>

          <div style={{ display: 'flex', flex: '1 0 0', minHeight: 0 }}>
            {/* The learner tree belongs to Training Plans */}
            {isPlans && (
              // navigation-tree/{width,min-width,max-width} — 300, drag 300–500
              <CollapsiblePanel defaultWidth={tree.width} minWidth={tree.minWidth} maxWidth={tree.maxWidth} tree>
                <LearnerTree />
              </CollapsiblePanel>
            )}

            <div
              style={{
                flex: '1 0 0',
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                padding: `${page.paddingY}px ${page.paddingX}px`,
                gap: 15,
                minHeight: 0,
              }}
            >
              {isDoa ? (
                <>
                  <TrainingToolbar {...doaActions(false, false)} searchPlaceholder="Search duties" />
                  <FilterRow filters={DOA_FILTERS} />

                  {/* The study's own view of the assignment gap. A site reads
                      it on its personnel; the study has no roster of its own,
                      so it belongs where the duty → course link lives. */}
                  {gapPeople > 0 && (
                    <div
                      role="status"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: sysMsg.gapS,
                        padding: sysMsg.paddingXY,
                        borderRadius: sysMsg.radius,
                        backgroundColor: '#fdf0ef',
                        border: `1px solid ${color.statusSolidRed}`,
                        flexShrink: 0,
                      }}
                    >
                      <FontAwesomeIcon icon={faCircleExclamation} style={{ width: icon.m, height: icon.m, color: color.critical, flexShrink: 0 }} />
                      <span style={{ ...type.body, color: color.sysMsgText, flex: '1 0 0', minWidth: 0 }}>
                        <b style={{ color: color.text }}>
                          {gapPeople} {gapPeople === 1 ? 'person is' : 'people are'} not enrolled
                        </b>{' '}
                        in a course required for a task their site&apos;s DOA log delegates to them, across {gapSites}{' '}
                        {gapSites === 1 ? 'site' : 'sites'}.
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowingGaps(true)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: `${btn.mediumPaddingY}px ${btn.mediumPaddingX}px`,
                          border: `1px solid ${color.border}`,
                          borderRadius: btn.radius,
                          backgroundColor: color.white,
                          color: color.primary,
                          cursor: 'pointer',
                          flexShrink: 0,
                          ...type.button,
                        }}
                      >
                        View gaps
                      </button>
                    </div>
                  )}

                  <DoaSection />
                </>
              ) : isLibrary ? (
                <>
                  <TrainingToolbar
                    {...libraryActions(librarySelected > 0, libraryView, () => go(authoringUrl()))}
                    searchPlaceholder={libraryView === 'Courses' ? 'Search courses' : 'Search learning plans'}
                  />
                  <FilterRow filters={LIBRARY_FILTERS} />

                  {/* Courses with no audience yet, counted above the grid —
                      the plans view has its own assignments and none open. */}
                  {libraryView === 'Courses' && <SuggestionBanner items={courses} onReview={() => setSuggesting(true)} />}

                  <span style={{ ...type.bodyBold, color: color.text }}>
                    {libraryView === 'Courses'
                      ? `${COURSE_TOTAL + courses.length - LIBRARY_COURSES.length} Courses`
                      : `${PLAN_TOTAL} Learning Plans`}
                    {librarySelected > 0 && <span style={{ ...type.body, color: color.textMuted }}> {librarySelected} Selected</span>}
                  </span>

                  {/* The view is the table's identity, so remounting on a view
                      switch clears the previous view's selection with it. */}
                  <LibraryTable
                    key={libraryView}
                    view={libraryView}
                    courses={courses}
                    onSelectionChange={setLibrarySelected}
                    onOpenTasks={() => setSection('doa')}
                    onApplySuggestion={(id, rule) =>
                      setCourses(prev =>
                        prev.map(c =>
                          c.id === id
                            ? {
                                ...c,
                                assignment: {
                                  kind: 'pair',
                                  sites: rule.sites === 'All' ? 'All' : rule.sites.length,
                                  roles: rule.roles === 'All' ? 'All' : rule.roles.length,
                                },
                              }
                            : c,
                        ),
                      )
                    }
                    onReview={() => setSuggesting(true)}
                  />
                </>
              ) : isSites ? (
                <>
                  <TrainingToolbar {...sitesActions(sitesSelected > 0)} searchPlaceholder="Search sites" />
                  <FilterRow filters={SITES_FILTERS} />

                  <span style={{ ...type.bodyBold, color: color.text }}>
                    {SITE_COUNT} Sites
                    {/* The selection count only appears once something is selected. */}
                    {sitesSelected > 0 && <span style={{ ...type.body, color: color.textMuted }}> {sitesSelected} Selected</span>}
                  </span>

                  {/* A site's profile is its own app — the name navigates. */}
                  <SitesTable onSelectionChange={setSitesSelected} onOpenSite={row => go(siteUrl(siteNumberOf(row.name)))} />
                </>
              ) : (
                <>
                  <TrainingToolbar {...trainingPlansActions(coursesSelected > 0)} searchPlaceholder="Search courses" />
                  <FilterRow filters={TRAINING_PLANS_FILTERS} />

                  <span style={{ ...type.bodyBold, color: color.text }}>{COURSE_COUNT} Courses</span>

                  <CourseTable onSelectionChange={setCoursesSelected} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {showingGaps && (
        <TrainingGapsDialog
          closed={closedGaps}
          onEnroll={keys => setClosedGaps(prev => new Set([...prev, ...keys]))}
          // Straight to their profile, opened on TASKS: the gap that got you
          // here is a task they carry, so that is the page that answers it.
          onOpenUser={row => go(userUrl(siteNumberOf(row.site), row.name, 'tasks'))}
          onClose={() => setShowingGaps(false)}
        />
      )}

      {suggesting && (
        <SuggestAssignmentDialog
          items={courses}
          onClose={() => setSuggesting(false)}
          onApply={accepted => {
            setCourses(prev =>
              prev.map(c => {
                const rule = accepted.get(c.id);
                if (!rule) return c;
                return {
                  ...c,
                  assignment: {
                    kind: 'pair',
                    sites: rule.sites === 'All' ? 'All' : rule.sites.length,
                    roles: rule.roles === 'All' ? 'All' : rule.roles.length,
                  },
                };
              }),
            );
            setSuggesting(false);
          }}
        />
      )}

    </div>
  );
}

export default StudyProfilePage;
