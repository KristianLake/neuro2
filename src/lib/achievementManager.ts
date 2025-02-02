import { useAchievementStore } from '../services/achievements/store';
import { Achievement } from '../services/achievements/types';

interface AchievementCallback {
  onAchievementEarned: (achievements: Achievement[]) => void;
}

export class AchievementManager {
  private checkIntroductionAchievements(
    code: string,
    uniqueMessages: Set<string>,
    runCount: number,
    earnedIds: Set<string>
  ): Achievement[] {
    const newAchievements: Achievement[] = [];

    // First Program - First successful code run
    if (!earnedIds.has('first-program')) {
      newAchievements.push({
        id: 'first-program',
        title: 'First Program',
        description: 'Ran your first program successfully!',
        xp: 50,
        icon: '🚀',
        lessonPath: '/lessons/introduction'
      });
    }

    // Hello, Coder! - Running Hello World
    if (code.includes('Hello') && !earnedIds.has('hello-coder')) {
      newAchievements.push({
        id: 'hello-coder',
        title: 'Hello, Coder!',
        description: 'Started your coding journey with your first program',
        xp: 25,
        icon: '👋',
        lessonPath: '/lessons/introduction'
      });
    }

    // Quick Learner - First try success
    if (runCount === 1 && !earnedIds.has('quick-learner')) {
      newAchievements.push({
        id: 'quick-learner',
        title: 'Quick Learner',
        description: 'Successfully ran code on your first try',
        xp: 25,
        icon: '⚡',
        lessonPath: '/lessons/introduction'
      });
    }

    // Code Explorer - Running code multiple times
    if (runCount >= 3 && !earnedIds.has('code-explorer')) {
      newAchievements.push({
        id: 'code-explorer',
        title: 'Code Explorer',
        description: 'Modified and ran the example code 3 times',
        xp: 30,
        icon: '🔍',
        lessonPath: '/lessons/introduction'
      });
    }

    // Creative Coder - Creating unique messages
    if (uniqueMessages.size > 0 && !earnedIds.has('creative-coder')) {
      newAchievements.push({
        id: 'creative-coder',
        title: 'Creative Coder',
        description: 'Created a unique message using console.log',
        xp: 35,
        icon: '🎨',
        lessonPath: '/lessons/introduction'
      });
    }

    // Personalized Hello - Modifying Hello World
    if (code.includes('Hello') && code !== 'console.log("Hello, World!");' && !earnedIds.has('personalized-hello')) {
      newAchievements.push({
        id: 'personalized-hello',
        title: 'Making It Personal',
        description: 'Personalized your Hello World message',
        xp: 20,
        icon: '✨',
        lessonPath: '/lessons/introduction'
      });
    }

    return newAchievements;
  }

  private getUserId(): string | null {
    try {
      const session = JSON.parse(localStorage.getItem('sb-gjvpvcxgwjijnykuzkdx-auth-token') || '{}');
      return session?.user?.id || null;
    } catch {
      return null;
    }
  }

  public setCallback(callback: AchievementCallback | null) {
    this.callback = callback;
  }

  public setForceUpdate(callback: (() => void) | null) {
    this.forceUpdate = callback;
  }

  private checkVariableAchievements(
    code: string,
    earnedIds: Set<string>
  ): Achievement[] {
    const newAchievements: Achievement[] = [];

    // Variable Master - First variable declaration
    if (code.includes('let ') && !earnedIds.has('variable-master')) {
      newAchievements.push({
        id: 'variable-master',
        title: 'Variable Master',
        description: 'Created and used your first variable successfully',
        xp: 50,
        icon: '📦',
        lessonPath: '/lessons/variables'
      });
    }

    // String Sage - Working with strings
    if ((code.includes('"') || code.includes("'")) && !earnedIds.has('string-sage')) {
      newAchievements.push({
        id: 'string-sage',
        title: 'String Sage',
        description: 'Successfully worked with text (string) variables',
        xp: 25,
        icon: '📝',
        lessonPath: '/lessons/variables'
      });
    }

    // Number Ninja - Working with numbers
    if (/let \w+ = \d+/.test(code) && !earnedIds.has('number-ninja')) {
      newAchievements.push({
        id: 'number-ninja',
        title: 'Number Ninja',
        description: 'Mastered working with numeric variables',
        xp: 25,
        icon: '🔢',
        lessonPath: '/lessons/variables'
      });
    }

    // Boolean Boss - Working with booleans
    if (/true|false/.test(code) && !earnedIds.has('boolean-boss')) {
      newAchievements.push({
        id: 'boolean-boss',
        title: 'Boolean Boss',
        description: 'Used true/false values in your code',
        xp: 25,
        icon: '✅',
        lessonPath: '/lessons/variables'
      });
    }

    // Array Ace - Working with arrays
    if (code.includes('[') && code.includes(']') && !earnedIds.has('array-ace')) {
      newAchievements.push({
        id: 'array-ace',
        title: 'Array Ace',
        description: 'Created and used an array to store multiple values',
        xp: 35,
        icon: '📚',
        lessonPath: '/lessons/variables'
      });
    }

    // Object Expert - Working with objects
    if (code.includes('{') && code.includes('}') && !earnedIds.has('object-expert')) {
      newAchievements.push({
        id: 'object-expert',
        title: 'Object Expert',
        description: 'Successfully created and used an object with properties',
        xp: 35,
        icon: '🎯',
        lessonPath: '/lessons/variables'
      });
    }

    // Name Wizard - Using descriptive variable names
    if (/let [a-zA-Z][a-zA-Z0-9]*[A-Z][a-zA-Z0-9]*/.test(code) && !earnedIds.has('name-wizard')) {
      newAchievements.push({
        id: 'name-wizard',
        title: 'Name Wizard',
        description: 'Used clear, descriptive variable names',
        xp: 25,
        icon: '✨',
        lessonPath: '/lessons/variables'
      });
    }

    // Value Changer - Updating variable values
    // Updated regex to better match variable reassignment patterns
    const valueChangerRegex = /let\s+(\w+)\s*=\s*[^;]+;\s*(?:.*\s+)?\1\s*=\s*[^;]+/;
    if (valueChangerRegex.test(code) && !earnedIds.has('value-changer')) {
      newAchievements.push({
        id: 'value-changer',
        title: 'Value Changer',
        description: 'Updated variable values after creating them',
        xp: 30,
        icon: '🔄',
        lessonPath: '/lessons/variables'
      });
    }

    // Null Navigator - Working with null/undefined
    if (/null|undefined/.test(code) && !earnedIds.has('null-navigator')) {
      newAchievements.push({
        id: 'null-navigator',
        title: 'Null Navigator',
        description: 'Worked with null and undefined values correctly',
        xp: 25,
        icon: '❓',
        lessonPath: '/lessons/variables'
      });
    }

    return newAchievements;
  }

  public checkAndAwardAchievements(
    params: {
      runCount: number,
      code: string,
      uniqueMessages: Set<string>,
      page?: string
    },
    awardAchievement: (id: string) => Promise<Achievement | null>,
    earnedAchievements: Achievement[] = []
  ): Achievement[] {
    // Only check achievements during practice mode
    if (!params.page) return [];
    const earnedIds = new Set(earnedAchievements.map(a => a.id));
    const newAchievements: Achievement[] = [];

    if (params.page === '/lessons/introduction') {
      const introAchievements = this.checkIntroductionAchievements(
        params.code,
        params.uniqueMessages,
        params.runCount,
        earnedIds
      );
      newAchievements.push(...introAchievements);
    } else if (params.page === '/lessons/variables') {
      const variableAchievements = this.checkVariableAchievements(params.code, earnedIds);
      newAchievements.push(...variableAchievements);
    }

    if (newAchievements.length > 0) {
      // Filter out any achievements that have already been earned
      const uniqueNewAchievements = newAchievements.filter(achievement => 
        !earnedIds.has(achievement.id)
      );

      if (uniqueNewAchievements.length > 0) {
        this.earnedAchievements = [...uniqueNewAchievements];
        
        // Award each achievement and wait for database updates
        Promise.all(uniqueNewAchievements.map(async achievement => {
          console.log('Awarding achievement:', achievement.id);
          await awardAchievement(achievement.id);
        })).then(() => {
          // Show achievement modal after database is updated
          if (this.callback) {
            this.callback.onAchievementEarned(uniqueNewAchievements);
          }
          this.pendingUpdate = true;
        });

      }

      return uniqueNewAchievements;
    }

    return [];
  }

  public onAchievementDismissed() {
    if (this.pendingUpdate && this.forceUpdate) {
      this.forceUpdate();
      this.pendingUpdate = false;
      window.dispatchEvent(new Event('achievementUpdate'));
    }
  }
}

export const achievementManager = new AchievementManager();