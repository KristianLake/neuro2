import { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useContentPublishing } from '../../../hooks/useContentPublishing';
import { BaseButton } from '../../base';
import { ContentStateIndicator } from './ContentStateIndicator';

interface ContentPublishingControlsProps {
  contentId: string;
  onStateChange?: () => void;
}

export function ContentPublishingControls({
  contentId,
  onStateChange
}: ContentPublishingControlsProps) {
  const { theme } = useTheme();
  const {
    loading,
    error,
    getContentState,
    createDraft,
    submitForReview,
    reviewContent,
    publishContent,
    archiveContent
  } = useContentPublishing(contentId);

  const [state, setState] = useState<Awaited<ReturnType<typeof getContentState>>>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [publishDate, setPublishDate] = useState<Date | null>(null);

  const handleAction = async (action: () => Promise<any>) => {
    try {
      await action();
      const newState = await getContentState();
      setState(newState);
      onStateChange?.();
    } catch (err) {
      console.error('Error performing action:', err);
    }
  };

  if (!state) return null;

  return (
    <div className="space-y-4">
      {/* Current State */}
      <div className="flex items-center justify-between">
        <ContentStateIndicator
          status={state.status}
          publishAt={state.publishAt}
        />
        
        {error && (
          <p className={`text-sm ${
            theme === 'dark' ? 'text-red-400' : 'text-red-600'
          }`}>
            {error}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {state.status === 'draft' && (
          <BaseButton
            variant="primary"
            onClick={() => handleAction(submitForReview)}
            isLoading={loading}
          >
            Submit for Review
          </BaseButton>
        )}

        {state.status === 'in_review' && (
          <>
            <BaseButton
              variant="primary"
              onClick={() => setShowReviewForm(true)}
              isLoading={loading}
            >
              Review
            </BaseButton>
            {showReviewForm && (
              <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4`}>
                <div className={`rounded-lg p-6 max-w-lg w-full ${
                  theme === 'dark'
                    ? 'bg-gray-800'
                    : theme === 'neurodivergent'
                    ? 'bg-amber-100/50'
                    : 'bg-white'
                }`}>
                  <h3 className={`text-lg font-medium mb-4 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Review Content
                  </h3>
                  <textarea
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className={`w-full rounded-md border-0 p-2 mb-4 ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-white border-gray-600'
                        : theme === 'neurodivergent'
                        ? 'bg-white text-gray-900 border-amber-200'
                        : 'bg-white text-gray-900 border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Enter feedback..."
                  />
                  <div className="flex justify-end gap-2">
                    <BaseButton
                      variant="secondary"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Cancel
                    </BaseButton>
                    <BaseButton
                      variant="danger"
                      onClick={() => {
                        handleAction(() => reviewContent(false, reviewFeedback));
                        setShowReviewForm(false);
                      }}
                      isLoading={loading}
                    >
                      Reject
                    </BaseButton>
                    <BaseButton
                      variant="primary"
                      onClick={() => {
                        handleAction(() => reviewContent(true, reviewFeedback));
                        setShowReviewForm(false);
                      }}
                      isLoading={loading}
                    >
                      Approve
                    </BaseButton>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {state.status === 'approved' && (
          <>
            <input
              type="datetime-local"
              value={publishDate?.toISOString().slice(0, 16) || ''}
              onChange={(e) => setPublishDate(new Date(e.target.value))}
              className={`rounded-md border-0 px-3 py-1.5 ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white border-gray-600'
                  : theme === 'neurodivergent'
                  ? 'bg-white text-gray-900 border-amber-200'
                  : 'bg-white text-gray-900 border-gray-300'
              }`}
            />
            <BaseButton
              variant="primary"
              onClick={() => handleAction(() => publishContent(publishDate || undefined))}
              isLoading={loading}
            >
              {publishDate ? 'Schedule' : 'Publish'} Now
            </BaseButton>
          </>
        )}

        {state.status === 'published' && (
          <BaseButton
            variant="danger"
            onClick={() => handleAction(archiveContent)}
            isLoading={loading}
          >
            Archive
          </BaseButton>
        )}

        {(state.status === 'archived' || state.status === 'published') && (
          <BaseButton
            variant="secondary"
            onClick={() => handleAction(createDraft)}
            isLoading={loading}
          >
            Create New Draft
          </BaseButton>
        )}
      </div>
    </div>
  );
}