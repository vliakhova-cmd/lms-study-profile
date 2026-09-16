import { useState } from 'react';
import { ChatMessage, FlowStage, LessonType, RightPanelTab } from './types';
import { AI_FOLLOWUP_RESPONSES, AI_INTRO_RESPONSE, DEFAULT_SOURCE_DOC } from './mockData';
import { SAVED_COURSE } from './savedCourseData';
import { ComposeStep } from './ComposeStep';
import { ThinkingStep } from './ThinkingStep';
import { SavingStep } from './SavingStep';
import { ResultStep } from './ResultStep';
import { useMediaQuery } from './useMediaQuery';

export interface AICourseAuthoringFlowProps {
  /**
   * The document the course is drafted from. Opened from a document, the
   * caller passes it in; opened from Create Course there is none yet, and the
   * compose step's source field is where one gets picked or uploaded.
   */
  initialSourceDoc?: string | null;
  onClose: () => void;
  /**
   * Called once the "Save as Draft" save has finished — the parent takes over
   * from here (closing this modal and navigating to the saved course, or
   * adding it to the library it was created from). The draft is described by
   * the source document it was generated from, which is also what names it.
   */
  onCourseSaved: (draft: { title: string; sourceDoc: string | null }) => void;
}

const now = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export function AICourseAuthoringFlow({ initialSourceDoc = DEFAULT_SOURCE_DOC, onClose, onCourseSaved }: AICourseAuthoringFlowProps) {
  const [stage, setStage] = useState<FlowStage>('compose');
  const isNarrow = useMediaQuery('(max-width: 640px)');

  // Compose state
  const [sourceDoc, setSourceDoc] = useState<string | null>(initialSourceDoc);
  const [description, setDescription] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('document');
  const [language, setLanguage] = useState('English');
  const [objectives, setObjectives] = useState<string[]>([]);

  // Result state
  const [activeSlideId, setActiveSlideId] = useState('page-1');
  const [rightTab, setRightTab] = useState<RightPanelTab>('edit');
  const [composedAt, setComposedAt] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [followUpPending, setFollowUpPending] = useState(false);
  const [followUpCount, setFollowUpCount] = useState(0);

  const changeObjective = (index: number, value: string) => {
    setObjectives(prev => prev.map((o, i) => (i === index ? value : o)));
  };

  const addObjective = () => setObjectives(prev => [...prev, '']);

  const handleGenerate = () => {
    setComposedAt(now());
    setStage('thinking');
    window.setTimeout(() => {
      setChatMessages([{ id: 'intro', from: 'ai', text: AI_INTRO_RESPONSE, timestamp: now() }]);
      setStage('result');
    }, 2600);
  };

  const handleSaveDraft = () => {
    setStage('saving');
    window.setTimeout(() => {
      // The saved course takes its name from the source document, the way
      // SAVED_COURSE does — so a course drafted from a picked document is
      // named after that document rather than the built-in one.
      onCourseSaved({ title: sourceDoc ?? SAVED_COURSE.title, sourceDoc });
    }, 1400);
  };

  const handleSendFollowUp = (text: string) => {
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, from: 'user', text, timestamp: now() };
    setChatMessages(prev => [...prev, userMsg]);
    setFollowUpPending(true);
    window.setTimeout(() => {
      const reply = AI_FOLLOWUP_RESPONSES[followUpCount % AI_FOLLOWUP_RESPONSES.length];
      setChatMessages(prev => [...prev, { id: `a-${Date.now()}`, from: 'ai', text: reply, timestamp: now() }]);
      setFollowUpCount(c => c + 1);
      setFollowUpPending(false);
    }, 1100);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(11,21,40,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: isNarrow ? 8 : 20,
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: 4,
          boxShadow: '0px 5px 12px rgba(0,0,0,0.2)',
          width: stage === 'result' ? 1350 : 850,
          maxWidth: '100%',
          height: stage === 'result' ? 900 : 'auto',
          minHeight: stage === 'compose' && !isNarrow ? 560 : undefined,
          maxHeight: isNarrow ? '96vh' : '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {stage === 'compose' && (
          <ComposeStep
            sourceDoc={sourceDoc}
            onPickSource={setSourceDoc}
            onRemoveSource={() => setSourceDoc(null)}
            description={description}
            onChangeDescription={setDescription}
            lessonType={lessonType}
            onChangeLessonType={setLessonType}
            language={language}
            onChangeLanguage={setLanguage}
            objectives={objectives}
            onChangeObjective={changeObjective}
            onAddObjective={addObjective}
            onCancel={onClose}
            onGenerate={handleGenerate}
          />
        )}

        {stage === 'thinking' && <ThinkingStep onCancel={onClose} />}

        {stage === 'saving' && <SavingStep />}

        {stage === 'result' && (
          <ResultStep
            activeSlideId={activeSlideId}
            onSelectSlide={setActiveSlideId}
            rightTab={rightTab}
            onChangeTab={setRightTab}
            description={description}
            composedAt={composedAt}
            chatMessages={chatMessages}
            onSendFollowUp={handleSendFollowUp}
            followUpPending={followUpPending}
            language={language}
            onChangeLanguage={setLanguage}
            objectives={objectives}
            onChangeObjective={changeObjective}
            onAddObjective={addObjective}
            onApply={() => setRightTab('edit')}
            onSaveDraft={handleSaveDraft}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}

export default AICourseAuthoringFlow;
