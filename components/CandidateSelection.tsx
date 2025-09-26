import React from 'react';
import { Candidate } from '../types';

interface CandidateSelectionProps {
  candidates: Candidate[];
  onSelect: (userId: string) => void;
}

const CandidateCard: React.FC<{ candidate: Candidate; onSelect: () => void }> = ({ candidate, onSelect }) => (
  <button
    onClick={onSelect}
    className="flex-shrink-0 w-56 bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#06C755] text-left space-y-2"
  >
    <div className="font-bold text-gray-800">
      ID: ...{candidate.userId.slice(-4)}
    </div>
    <div className="text-sm text-gray-500">
      <p>最終: {candidate.lastTs}</p>
      <p>件数: {candidate.count}</p>
    </div>
  </button>
);


const CandidateSelection: React.FC<CandidateSelectionProps> = ({ candidates, onSelect }) => {
  return (
    <div className="py-6 bg-[#EDEEF2] h-full flex flex-col">
       <h2 className="text-base font-semibold text-gray-700 mb-4 px-6">複数の候補が見つかりました</h2>
       <div className="flex-1 flex items-start">
        <div className="w-full flex items-center gap-4 px-6 pb-4 overflow-x-auto">
              {candidates.map((candidate) => (
                  <CandidateCard
                      key={candidate.userId}
                      candidate={candidate}
                      onSelect={() => onSelect(candidate.userId)}
                  />
              ))}
        </div>
       </div>
    </div>
  );
};

export default CandidateSelection;