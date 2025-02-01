import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import sanitizeHtml from 'sanitize-html';
import { useAchievements } from '../hooks/useAchievements';
import { achievementManager } from '../lib/achievementManager';
import { themeConfig } from '../config/theme';

interface CodeError {
  type: string;
  message: string;
  line?: number;
  column?: number;
  helpLink?: string;
  suggestion?: string;
}

interface CodeOutput {
  result: string;
  errors: CodeError[];
  hints: string[];
}
import { useTheme } from '../contexts/ThemeContext';
import { commonThemeStyles } from '../utils/theme';

interface CodeEditorProps {
  onSuccess?: () => void;
  onSuccessfulRun?: () => void;
  page?: string;
}

export default function CodeEditor({ onSuccessfulRun, page }: CodeEditorProps = {}) {
  const { theme } = useTheme();
  const { awardAchievement, achievements } = useAchievements();
  const defaultCode = `// Try writing some code here!
console.log("Hello, World!");`;

  const [code, setCode] = useState(defaultCode);
  const [output, setOutput] = useState<CodeOutput>({ result: '', errors: [], hints: [] });
  const [runCount, setRunCount] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const uniqueMessages = new Set<string>();

  // Reset counters when component unmounts
  useEffect(() => {
    return () => {
      setRunCount(0);
    };
  }, []);

  const createSecureFunction = (code: string): Function => {
    const allowedGlobals = new Set(['console', 'Math', 'Date', 'parseInt', 'parseFloat', 'String', 'Number', 'Array']);
    
    const secureContext: any = {};
    for (const global of allowedGlobals) {
      if (global in window) {
        secureContext[global] = (window as any)[global];
      }
    }

    let output = '';
    secureContext.console = {
      log: (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'string' ? sanitizeHtml(arg) : String(arg)
        ).join(' ');
        output += message + '\n';
        
        // Add non-default messages to the set
        const trimmedMessage = message.trim();
        if (trimmedMessage !== 'Hello, World!' && trimmedMessage !== '') {
          uniqueMessages.add(trimmedMessage);
        }
      }
    };

    try {
      const secureFunction = new Function(
        ...Object.keys(secureContext),
        `"use strict";
        try {
          ${code}
        } catch (e) {
          throw e;
        }`
      );

      return () => {
        secureFunction.apply(null, Object.values(secureContext));
        return output;
      };
    } catch (e) {
      throw e;
    }
  };

  const findLineAndColumn = (code: string, searchText: string): { line: number; column: number } => {
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const column = lines[i].indexOf(searchText);
      if (column !== -1) {
        return { line: i + 1, column: column + 1 };
      }
    }
    return { line: 1, column: 1 };
  };

  const analyzeCode = (code: string): CodeError[] => {
    const errors: CodeError[] = [];
    const lines = code.split('\n');
    
    // Count comment markers
    const openComments = (code.match(/\/\*/g) || []).length;
    const closeComments = (code.match(/\*\//g) || []).length;
    
    // Check for mismatched comment markers
    if (openComments > closeComments) {
      errors.push({
        type: 'CommentError',
        message: 'You have an unclosed multi-line comment. Make sure to close it with */'
      });
      return errors;
    } else if (closeComments > openComments) {
      errors.push({
        type: 'CommentError',
        message: 'Found a comment closing marker */ without a matching opening /*'
      });
      return errors;
    }

    let inConsoleLog = false;
    let consoleLogStartLine = 0;
    let stringStartLine = 0;
    let openQuote = '';
    
    lines.forEach((line, index) => {
      if (line.includes('console.log')) {
        inConsoleLog = true;
        consoleLogStartLine = index;
      }

      if (inConsoleLog) {
        // Check for string start
        if (!openQuote && (line.includes('"') || line.includes("'"))) {
          openQuote = line.includes('"') ? '"' : "'";
          stringStartLine = index;
        }
        // Check for string end
        if (openQuote && line.includes(openQuote)) {
          if (stringStartLine !== index) {
            errors.push({
              type: 'StringError',
              message: 'Looks like you\'re trying to write text across multiple lines! In JavaScript, strings need to stay on one line.',
              line: stringStartLine + 1,
              column: lines[stringStartLine].indexOf(openQuote) + 1,
              helpLink: '/learn/strings',
              suggestion: 'Keep your text on one line, or use + to combine strings. For example: console.log("Hello, " + "World!");'
            });
            return errors;
          }
          openQuote = '';
        }
        
        if (line.includes(');')) {
          inConsoleLog = false;
        }
      }
    });

    // If we found multiline string errors, return them immediately
    if (errors.length > 0) {
      return errors;
    }

    // Then proceed with other syntax checks
    try {
      new Function(code);
    } catch (e: any) {
      const errorMessage = e.message;
      
      // If it's a regex error (from single forward slash), treat it as a comment error
      if (errorMessage.includes('Invalid regular expression')) {
        const lineWithSlash = lines.findIndex(line => line.includes('/'));
        errors.push({
          type: 'CommentError',
          message: 'Looks like you\'re trying to write a comment! Comments in JavaScript need two forward slashes.',
          line: lineWithSlash + 1,
          column: lines[lineWithSlash].indexOf('/') + 1,
          helpLink: page === '/learn/comments' ? undefined : '/learn/comments',
          suggestion: page === '/learn/comments'
            ? 'Look at the "Single-Line Comments" section above to see how to write comments correctly.'
            : 'Use two forward slashes to write a comment. For example: // This is a comment'
        });
        return errors;
      }

      // Handle multiline string errors
      if (errorMessage.includes('Invalid or unexpected token')) {
        const lineWithQuote = lines.findIndex(line => line.includes('"') || line.includes("'"));
        if (lineWithQuote !== -1) {
          errors.push({
            type: 'StringError',
            message: 'Looks like you\'re trying to write text across multiple lines! In JavaScript, strings need to stay on one line.',
            line: lineWithQuote + 1,
            column: lines[lineWithQuote].indexOf('"') !== -1 ? lines[lineWithQuote].indexOf('"') + 1 : lines[lineWithQuote].indexOf("'") + 1,
            helpLink: '/learn/strings',
            suggestion: 'Keep your text on one line, or use + to combine strings. For example: console.log("Hello, " + "World!");'
          });
          return errors;
        }
      }
      
      if (errorMessage.includes('Unexpected end of input')) {
        errors.push({
          type: 'SyntaxError',
          message: 'Your code seems incomplete. Did you forget to close something?',
          helpLink: '/learn/syntax-basics',
          suggestion: 'Check for missing closing brackets, quotes, or parentheses.'
        });
        return errors;
      }
      
      errors.push({
        type: 'SyntaxError',
        message: errorMessage,
        helpLink: '/learn/syntax-errors'
      });
      return errors;
    }

    lines.forEach((line, index) => {
      // Check for single forward slash comments
      if (line.includes('/') && !line.includes('//') && !line.includes('/*')) {
        const { line: lineNum, column } = findLineAndColumn(code, '/');
        // Skip if the slash is part of a string
        const isInString = line.slice(0, line.indexOf('/')).includes('"') || 
                          line.slice(0, line.indexOf('/')).includes("'");
        if (!isInString) {
          errors.push({
            type: 'CommentError',
            message: 'Invalid comment syntax. Comments need two forward slashes (//).',
            line: lineNum, 
            column, 
            suggestion: page === '/learn/comments'
              ? 'Look at the "Single-Line Comments" section above to see how to write comments correctly.'
              : 'Use // to start a comment. For example: // This is a comment'
          });
        }
      }

      if (line.includes('//')) {
        const codeAfterComment = line.split('//')[1].trim();
        if (codeAfterComment.includes('console.log') || codeAfterComment.includes('function')) {
          const { line: lineNum, column } = findLineAndColumn(code, '//');
          errors.push({
            type: 'CommentError',
            message: 'You have code after a comment. Comments make everything after // on the same line inactive.',
            line: lineNum, 
            column, 
            suggestion: page === '/learn/comments'
              ? 'Review the examples above - remember that anything after // on the same line becomes a comment.'
              : 'Move the code to a new line after the comment.'
          });
        }
      }

      if (line.includes('console.log')) {
        if (!line.includes('(')) {
          const { line: lineNum, column } = findLineAndColumn(code, 'console.log');
          errors.push({
            type: 'ConsoleError',
            message: 'console.log needs parentheses () to work.',
            line: lineNum,
            column,
            helpLink: '/learn/console-log',
            suggestion: 'Add parentheses after console.log like this: console.log()'
          });
        }
        else if (line.includes('(') && !line.includes(')')) {
          const { line: lineNum, column } = findLineAndColumn(code, '(');
          errors.push({
            type: 'ConsoleError',
            message: 'You opened a parenthesis but didn\'t close it.',
            line: lineNum,
            column,
            helpLink: '/learn/parentheses',
            suggestion: 'Add a closing parenthesis ) to match the opening one.'
          });
        }
        else if (line.includes('console.log(') && 
                !line.includes('"') && 
                !line.includes("'") && 
                !line.match(/\d+/)) {
          const { line: lineNum, column } = findLineAndColumn(code, 'console.log');
          errors.push({
            type: 'StringError',
            message: 'Text needs to be wrapped in quotes.',
            line: lineNum,
            column,
            helpLink: '/learn/strings',
            suggestion: 'Put your text inside quotes like this: console.log("Hello")'
          });
        }
        else if ((line.match(/"/g) || []).length % 2 !== 0 || 
                 (line.match(/'/g) || []).length % 2 !== 0) {
          const { line: lineNum, column } = findLineAndColumn(code, line.includes('"') ? '"' : "'");
          errors.push({
            type: 'StringError',
            message: 'You have an unclosed string. Strings need opening and closing quotes.',
            line: lineNum,
            column,
            helpLink: '/learn/strings',
            suggestion: 'Add a matching quote to close your string.'
          });
        }
      }

      if (line.trim().endsWith('console') || line.trim().endsWith('console.')) {
        const { line: lineNum, column } = findLineAndColumn(code, line.trim());
        errors.push({
          type: 'NewlineError',
          message: 'console.log should be on one line.',
          line: lineNum,
          column,
          helpLink: '/learn/console-log',
          suggestion: 'Write the complete console.log() statement on a single line.'
        });
      }
    });

    return errors;
  };

  const generateHints = (code: string): string[] => {
    const hints: string[] = [];
    const lines = code.split('\n');

    if (code.includes('console.log')) {
      if (!code.includes('"') && !code.includes("'")) {
        hints.push('💡 Try printing a message using quotes: console.log("Hello!")');
      }
      if (!code.match(/\d+/)) {
        hints.push('💡 You can also print numbers without quotes: console.log(42)');
      }
      if (!code.includes(',')) {
        hints.push('💡 Print multiple items using commas: console.log("Count:", 123)');
      }
    }

    if (lines[0].trim() === '') {
      hints.push('💡 You can start writing your code on the first line');
    }

    if (code.includes('//') && lines.some(line => line.trim().startsWith('//'))) {
      hints.push('💡 Comments are great for notes, but make sure your actual code isn\'t commented out');
    }

    return hints;
  };

  const runCode = async () => {
    if (isExecuting) return;

    const uniqueMessages = new Set<string>();

    try {
      setIsExecuting(true);
      setOutput({ result: '', errors: [], hints: [] });

      const errors = analyzeCode(code);
      const hints = generateHints(code);

      if (errors.length > 0) {
        setOutput({ result: '', errors, hints });
        return;
      }

      const secureFunc = createSecureFunction(code);
      const result = secureFunc();

      setOutput({ result, errors, hints });

      // Only count successful runs
      const newRunCount = runCount + 1;
      setRunCount(newRunCount);

      // Check and award achievements
      achievementManager.checkAndAwardAchievements(
        {
          runCount: newRunCount,
          code,
          uniqueMessages: uniqueMessages,
          page
        },
        awardAchievement,
        achievements
      );

      if (onSuccessfulRun) {
        onSuccessfulRun();
      }

    } catch (error: any) {
      setOutput({
        result: '',
        errors: [{
          type: 'RuntimeError',
          message: error.message,
          helpLink: '/learn/runtime-errors',
          suggestion: 'Check if your code is doing something unexpected while running.'
        }],
        hints: generateHints(code)
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const resetCode = () => {
    setCode(defaultCode);
    setOutput({ result: '', errors: [], hints: [] });
  };

  return (
    <div className="flex flex-col space-y-4 w-full" data-code-editor>
      {/* Editor Panel */}
      <div className={`flex flex-col border rounded-lg overflow-hidden ${
        theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.main} border-${themeConfig.colors.dark.border.base}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.card} border-${themeConfig.colors.neurodivergent.border.base}`
          : `bg-${themeConfig.colors.light.background.card} border-${themeConfig.colors.light.border.base}`
      }`}>
        <div className={`p-3 border-b ${
          theme === 'dark'
            ? `bg-${themeConfig.colors.dark.background.main} border-${themeConfig.colors.dark.border.base}`
            : theme === 'neurodivergent'
            ? `bg-${themeConfig.colors.neurodivergent.background.card} border-${themeConfig.colors.neurodivergent.border.base}`
            : `bg-${themeConfig.colors.light.background.card} border-${themeConfig.colors.light.border.base}`
        }`}>
          <h2 className={`text-lg font-semibold ${
            theme === 'dark'
              ? `text-${themeConfig.colors.dark.text.primary}`
              : theme === 'neurodivergent'
              ? `text-${themeConfig.colors.neurodivergent.text.primary}`
              : `text-${themeConfig.colors.light.text.primary}`
          }`}>Code Editor</h2>
        </div>
        <div className="h-[200px]">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme={theme === 'light' ? 'vs-light' : 'vs-dark'}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: 'on',
              suggestOnTriggerCharacters: false,
              quickSuggestions: false,
            }}
          />
        </div>
      </div>

      {/* Output Panel */}
      <div className={`flex flex-col border rounded-lg overflow-hidden ${
        theme === 'dark'
          ? `bg-${themeConfig.colors.dark.background.card}`
          : theme === 'neurodivergent'
          ? `bg-${themeConfig.colors.neurodivergent.background.card}`
          : `bg-${themeConfig.colors.light.background.card}`
      }`}>
        <div className={`p-3 border-b ${
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600'
            : theme === 'neurodivergent' 
            ? 'bg-amber-50 border-amber-200'
            : 'bg-white border-gray-200'
        }`}>
          <h2 className={`text-lg font-semibold ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>Output</h2>
        </div>
        <div className="p-4 max-h-[200px] overflow-auto">
          {/* Code Output */}
          {output.result && (
            <div className="mb-4">
              <h3 className={`font-semibold mb-2 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>Result:</h3>
              <pre className={`p-3 rounded-lg whitespace-pre-wrap ${
                theme === 'dark'
                  ? 'bg-gray-800 text-gray-200'
                  : theme === 'neurodivergent'
                  ? 'bg-amber-50 text-gray-900'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {output.result}
              </pre>
            </div>
          )}

          {/* Errors */}
          {output.errors.length > 0 && (
            <div className="mb-4">
              <h3 className={`font-semibold mb-2 ${
                theme === 'dark'
                  ? 'text-red-400'
                  : theme === 'neurodivergent'
                  ? 'text-red-800'
                  : 'text-red-600'
              }`}>Errors:</h3>
              {output.errors.map((error, index) => (
                <div key={index} className={`rounded-lg p-4 mb-4 ${
                  theme === 'dark'
                    ? `bg-${themeConfig.colors.dark.background.error}/20 border border-${themeConfig.colors.dark.border.error}`
                    : theme === 'neurodivergent'
                    ? `bg-${themeConfig.colors.neurodivergent.background.error} border border-${themeConfig.colors.neurodivergent.border.error}`
                    : `bg-${themeConfig.colors.light.background.error} border border-${themeConfig.colors.light.border.error}`
                }`}>
                  <p className={`font-medium ${
                    theme === 'dark'
                      ? 'text-red-300'
                      : theme === 'neurodivergent'
                      ? 'text-red-800'
                      : 'text-red-700'
                  }`}>
                    {error.type}: {error.message}
                    {error.line && error.column && ` (Line ${error.line}, Column ${error.column})`}
                  </p>
                  {error.suggestion && (
                    <p className={`mt-1 text-sm ${
                      theme === 'dark'
                        ? 'text-red-400'
                        : theme === 'neurodivergent'
                        ? 'text-red-700'
                        : 'text-red-600'
                    }`}>
                      Suggestion: {error.suggestion}
                    </p>
                  )}
                  {error.helpLink && (
                    <a 
                      href={error.helpLink}
                      className={`inline-flex items-center gap-1 text-sm mt-2 px-3 py-1.5 rounded-md transition-colors ${
                        theme === 'dark'
                          ? 'text-red-400 hover:text-red-300 bg-red-900/30 border border-red-800 hover:bg-red-900/50'
                          : theme === 'neurodivergent'
                          ? 'text-red-700 hover:text-red-800 bg-red-50 border border-red-200 hover:bg-red-100'
                          : 'text-red-600 hover:text-red-800 bg-red-50 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      <span>📚 Click here to learn more about this error</span>
                      <span className="text-lg">→</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Hints */}
          {output.hints.length > 0 && (
            <div>
              <h3 className={`font-semibold mb-2 ${
                theme === 'dark'
                  ? 'text-indigo-400'
                  : theme === 'neurodivergent'
                  ? 'text-teal-600'
                  : 'text-indigo-600'
              }`}>Hints:</h3>
              {output.hints.map((hint, index) => (
                <div key={index} className={`rounded-lg p-3 mb-2 ${
                  theme === 'dark'
                    ? 'bg-indigo-900/20 border border-indigo-800'
                    : theme === 'neurodivergent'
                    ? 'bg-teal-50 border border-teal-200'
                    : 'bg-indigo-50 border border-indigo-200'
                }`}>
                  <p className={
                    theme === 'dark'
                      ? 'text-indigo-300'
                      : theme === 'neurodivergent'
                      ? 'text-teal-700'
                      : 'text-indigo-700'
                  }>{hint}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 p-2">
        <button
          onClick={resetCode}
          className={`px-4 py-2 text-sm rounded transition-colors ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : theme === 'neurodivergent'
              ? 'bg-amber-100 text-gray-700 hover:bg-amber-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Reset Code
        </button>
        <button
          onClick={runCode}
          className={`px-4 py-2 text-sm rounded text-white transition-colors ${
            theme === 'dark'
              ? 'bg-indigo-500 hover:bg-indigo-400'
              : theme === 'neurodivergent'
              ? 'bg-teal-600 hover:bg-teal-500'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Run Code
        </button>
      </div>
    </div>
  );
}