import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import CodeEditor from '../../components/CodeEditor';
import AchievementList from '../../components/AchievementList';
import AchievementModal from '../../components/AchievementModal';
import { useAuth } from '../../contexts/AuthContext';
import { useAchievements } from '../../hooks/useAchievements';
import { achievementManager } from '../../lib/achievementManager';
import { COMMENT_ACHIEVEMENTS } from '../../lib/achievements';
import { Achievement } from '../../types/achievements';

export default function Comments() {
  const { user } = useAuth();
  const { achievements } = useAchievements();
  const location = useLocation();
  const [returnPath] = useState(location.state?.from || '/lessons/introduction');
  const [showingAchievement, setShowingAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Force re-render when achievements are earned
  const triggerUpdate = useCallback(() => {
    setForceUpdate(prev => prev + 1);
  }, []);

  useEffect(() => {
    achievementManager.setCallback({
      onAchievementEarned: (newAchievements) => {
        setAchievementQueue(prev => [...prev, ...newAchievements]);
        if (!showingAchievement) {
          setCurrentAchievement(newAchievements[0]);
          setShowingAchievement(true);
        }
      }
    });

    achievementManager.setForceUpdate(triggerUpdate);

    return () => {
      achievementManager.setCallback(null);
      achievementManager.setForceUpdate(null);
    };
  }, [triggerUpdate, showingAchievement]);

  const dismissAchievement = () => {
    if (achievementQueue.length <= 1) {
      setShowingAchievement(false);
      setCurrentAchievement(null);
      setAchievementQueue([]);
      achievementManager.onAchievementDismissed();
    } else {
      // Update to show next achievement
      const [_, ...remainingAchievements] = achievementQueue;
      setAchievementQueue(remainingAchievements);
      setCurrentAchievement(remainingAchievements[0]);
    }
  };

  // Split achievements into earned and available
  const commentAchievements = COMMENT_ACHIEVEMENTS;
  const earnedCommentAchievements = achievements.filter(
    achievement => commentAchievements.some(a => a.id === achievement.id) 
  );
  const availableCommentAchievements = commentAchievements.filter(
    achievement => !earnedCommentAchievements.some(earned => earned.id === achievement.id)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <AchievementModal
        showing={showingAchievement}
        achievement={currentAchievement}
        queue={achievementQueue}
        onDismiss={dismissAchievement}
      />

      {/* Return to Lesson Button */}
      <div className="max-w-3xl mx-auto mb-8">
        <Link
          to={returnPath}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-700"
        >
          <span className="text-xl mr-1">←</span>
          <span>Return to Lesson</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Introduction */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Understanding Comments</h1>
          <p className="text-gray-600 mb-4">
            Comments are notes we write in our code that the computer ignores. They help us (and others) 
            understand what our code does. Think of them like sticky notes in a cookbook!
          </p>
          <div className="bg-white/50 rounded-lg p-4">
            <h2 className="font-semibold text-gray-800 mb-2">In this guide:</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Learn how to write comments</li>
              <li>Understand when to use them</li>
              <li>Practice with examples</li>
              <li>Try it yourself</li>
            </ul>
          </div>
        </div>

        {/* How to Write Comments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Write Comments</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Single-Line Comments</h3>
                <p className="text-gray-600 mb-2">
                  Start with two forward slashes (//). Everything after // on that line is a comment.
                </p>
                <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
                  <p className="text-green-400">// This is a comment</p>
                  <p>console.log("Hello!");</p>
                  <p className="text-green-400">// This explains what's happening</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Multi-Line Comments</h3>
                <p className="text-gray-600 mb-2">
                  For longer comments, use /* to start and */ to end. Everything between these markers is a comment,
                  even across multiple lines.
                </p>
                <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
                  <p className="text-green-400">/* This is a multi-line comment.</p>
                  <p className="text-green-400">   It can span multiple lines,</p>
                  <p className="text-green-400">   and is great for longer explanations. */</p>
                  <p>console.log("Hello!");</p>
                  <p>&nbsp;</p>
                  <p>/* Single-line works too */ console.log("Hi!");</p>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Important Rules:</h3>
                <ul className="space-y-2 text-yellow-700">
                  <li>• Comments need two slashes (//) - one isn't enough!</li>
                  <li>• Everything after // is ignored by the computer</li>
                  <li>• Each new line needs its own //</li>
                  <li>• Comments can go at the end of code lines too</li>
                  <li>• For multiple lines, use /* and */ instead of many //</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* When to Use Comments */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">When to Use Comments</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Good Uses:</h3>
                <ul className="space-y-2 text-green-700">
                  <li>✅ Explaining complex code</li>
                  <li>✅ Documenting important details</li>
                  <li>✅ Making notes for yourself</li>
                  <li>✅ Temporarily disabling code</li>
                </ul>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Avoid:</h3>
                <ul className="space-y-2 text-red-700">
                  <li>❌ Stating the obvious</li>
                  <li>❌ Every single line</li>
                  <li>❌ Outdated comments</li>
                  <li>❌ Code that's commented forever</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Examples</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Basic Comments</h3>
              <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-green-400">// Print a greeting</p>
                <p>console.log("Hello!");</p>
                <p>&nbsp;</p>
                <p className="text-green-400">// Print a number</p>
                <p>console.log(42);</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">End-of-Line Comments</h3>
              <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
                <p>console.log("Hello!"); <span className="text-green-400">// Prints a greeting</span></p>
                <p>console.log(42); <span className="text-green-400">// The answer to everything</span></p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Common Mistakes</h3>
              <div className="bg-gray-800 text-gray-100 rounded-lg p-4 font-mono text-sm">
                <p className="text-red-400">/* Unclosed comment will break your code</p>
                <p className="text-red-400">/* Nested /* comments */ don't work */</p>
                <p className="text-red-400">/ This won't work (needs two slashes)</p>
                <p className="text-red-400">console.log("Hi") // This code is commented out</p>
                <p>&nbsp;</p>
                <p className="text-green-400">// This is correct</p>
                <p>console.log("Hi"); <span className="text-green-400">// This comment is fine</span></p>
                <p className="text-green-400">/* This multi-line</p>
                <p className="text-green-400">   comment is also correct */</p>
              </div>
            </div>
          </div>
        </section>

        {/* Practice Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Try It Yourself!</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Practice Exercise</h3>
              <p className="text-blue-700">
                Try writing some code with comments! Here are some ideas:
              </p>
              <ul className="list-disc pl-5 text-blue-700 mt-2">
                <li>Add a comment explaining what your code does</li>
                <li>Try an end-of-line comment</li>
                <li>Write a multi-line comment</li>
                <li>Fix the common mistakes shown above</li>
              </ul>
            </div>

            <CodeEditor page="/learn/comments" />
          </div>
        </section>

        {/* Achievement Showcase - only show for logged in users */}
        {user && (
          <div className="mt-8">
            <AchievementList
              earnedAchievements={earnedCommentAchievements}
              availableAchievements={availableCommentAchievements}
              showLessonLinks={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}