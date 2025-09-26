import React from 'react';

interface DateChipProps {
  date: string;
}

const DateChip: React.FC<DateChipProps> = ({ date }) => {
  return (
    <div className="flex justify-center my-4">
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#D7DBE0] text-gray-700">
        {date}
      </span>
    </div>
  );
};

export default DateChip;
