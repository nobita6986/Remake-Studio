import React, { useMemo } from 'react';

interface ChatMessageContentProps {
  content: string;
}

export const ChatMessageContent: React.FC<ChatMessageContentProps> = ({ content }) => {
  const parsedTable = useMemo(() => {
    const lines = content.split('\n').filter(line => line.trim().startsWith('|') && line.trim().endsWith('|'));
    if (lines.length < 2) {
      return null; // Not a table if no header/separator and at least one row
    }

    const headerMatch = lines[0];
    const separatorMatch = lines[1];

    if (!separatorMatch || !separatorMatch.includes('---')) {
      return null;
    }

    const headers = headerMatch.slice(1, -1).split('|').map(h => h.trim());
    const dataRows = lines.slice(2).map(rowLine => rowLine.slice(1, -1).split('|').map(c => c.trim()));

    if (dataRows.length === 0) return null;

    return { headers, dataRows };
  }, [content]);

  if (parsedTable) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-gray-300 dark:border-gray-500">
              {parsedTable.headers.map((h, i) => (
                <th key={i} className="p-2 font-semibold text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parsedTable.dataRows.map((row, i) => (
              <tr key={i} className="border-b border-gray-200 dark:border-gray-700 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="p-2 align-top">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <pre className="whitespace-pre-wrap break-words font-sans text-sm">{content}</pre>;
};
