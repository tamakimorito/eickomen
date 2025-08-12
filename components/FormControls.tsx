import React, { useState, useRef, useEffect } from 'https://esm.sh/react@^19.1.0';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/outline';

export const FormInput = ({ label, name, value, onChange, className = '', isInvalid, ...props }) => {
    const labelClasses = `block text-sm font-bold mb-1 ${isInvalid ? 'text-red-600' : 'text-gray-700'}`;
    const inputClasses = `block w-full px-3 py-2 bg-white border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`;
    return (
        <div className={className}>
            <label htmlFor={name} className={labelClasses}>{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>
            <input
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
            />
        </div>
    );
};

export const FormSelect = ({ label, name, value, onChange, options, className = '', isInvalid, ...props }) => {
    const labelClasses = `block text-sm font-bold mb-1 ${isInvalid ? 'text-red-600' : 'text-gray-700'}`;
    const selectClasses = `block w-full px-3 py-2 bg-white border rounded-lg shadow-sm focus:outline-none sm:text-sm ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`;

    return(
        <div className={className}>
            <label htmlFor={name} className={labelClasses}>{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>
            <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={selectClasses}
            {...props}
            >
            <option value="">選択してください</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
            </select>
        </div>
    );
};

export const FormRadioGroup = ({ label, name, value, onChange, options, className = '', isInvalid, ...props }) => {
    const legendClasses = `block text-sm font-bold mb-2 ${isInvalid ? 'text-red-600' : 'text-gray-700'}`;
    
    const handleRadioClick = (e) => {
        const clickedValue = e.target.value;
        if (clickedValue === value) {
            // If the user clicks the currently selected radio button, clear the selection.
            const syntheticEvent = {
                target: { name, value: '', type: 'radio' }
            };
            onChange(syntheticEvent);
        } else {
            // Otherwise, perform the default change action.
            onChange(e);
        }
    };

    return (
        <fieldset className={className}>
            {label && <legend className={legendClasses}>{label}{props.required && <span className="text-red-500 ml-1">*</span>}</legend>}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
                {options.map((option, index) => {
                    if ('type' in option && option.type === 'break') {
                        return <div key={`break-${index}`} className="basis-full h-0"></div>;
                    }
                    const radioOption = option;
                    return (
                        <div key={radioOption.value} className="flex items-center">
                            <input
                                id={`${name}-${radioOption.value}`}
                                name={name}
                                type="radio"
                                value={radioOption.value}
                                checked={value === radioOption.value}
                                onChange={handleRadioClick} // Use the custom handler
                                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`${name}-${radioOption.value}`} className="ml-2 block text-sm text-gray-900">
                                {radioOption.label}
                            </label>
                        </div>
                    );
                })}
            </div>
        </fieldset>
    );
};

export const FormTextArea = ({ label, name, value, onChange, className = '', isInvalid, ...props }) => {
    const labelClasses = `block text-sm font-bold mb-1 ${isInvalid ? 'text-red-600' : 'text-gray-700'}`;
    const textareaClasses = `block w-full px-3 py-2 bg-white border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm ${isInvalid ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}`;

    return (
        <div className={className}>
            <label htmlFor={name} className={labelClasses}>{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>
            <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            className={textareaClasses}
            {...props}
            />
        </div>
    );
};

export const FormCheckbox = ({ label, name, checked, onChange, description, className = '', isInvalid, ...props }) => {
    const labelClasses = `font-bold ${isInvalid ? 'text-red-600' : 'text-gray-700'}`;
    return (
        <div className={`relative flex items-start ${className}`}>
            <div className="flex items-center h-5">
            <input
                id={name}
                name={name}
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                {...props}
            />
            </div>
            <div className="ml-3 text-sm">
            <label htmlFor={name} className={labelClasses}>{label}</label>
            {description && <p className="text-gray-500">{description}</p>}
            </div>
        </div>
    );
};

const CalendarPopover = ({ onDateSelect, initialDate }) => {
    const [viewDate, setViewDate] = useState(initialDate || new Date());
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sunday

    const calendarDays = Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`empty-${i}`}></div>);

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const isSelected = initialDate &&
            initialDate.getDate() === day &&
            initialDate.getMonth() === month &&
            initialDate.getFullYear() === year;
        
        const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

        calendarDays.push(
            <button
                key={day}
                type="button"
                onClick={() => onDateSelect(currentDate)}
                className={`flex items-center justify-center w-9 h-9 text-sm rounded-full transition-colors ${
                    isSelected ? 'bg-blue-600 text-white font-bold' : 
                    isToday ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
                {day}
            </button>
        );
    }
    
    return (
        <div className="absolute top-full mt-2 z-20 bg-white rounded-xl shadow-lg p-4 border border-gray-200 w-72">
            <div className="flex justify-between items-center mb-3">
                <button type="button" onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronLeftIcon className="h-5 w-5 text-gray-600"/></button>
                <div className="font-bold text-gray-800">{`${year}年 ${month + 1}月`}</div>
                <button type="button" onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-full hover:bg-gray-100"><ChevronRightIcon className="h-5 w-5 text-gray-600"/></button>
            </div>
            <div className="grid grid-cols-7 text-center text-xs text-gray-500 font-semibold mb-2">
                {['日', '月', '火', '水', '木', '金', '土'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {calendarDays}
            </div>
        </div>
    );
};

export const FormDateInput = ({ label, name, value, onChange, isInvalid, onBlur, className = '', ...props }) => {
  const [isCalendarOpen, setCalendarOpen] = useState(false);
  const wrapperRef = useRef(null);

  const handleDateSelect = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}/${month}/${day}`;
    
    const syntheticEvent = {
        target: { name, value: formattedDate, type: 'text' },
    };
    
    onChange(syntheticEvent);
    setCalendarOpen(false);
  };
  
  const selectedDate = value && !isNaN(new Date(value).getTime()) ? new Date(value) : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
        <FormInput
            label={label}
            name={name}
            value={value}
            onChange={onChange}
            isInvalid={isInvalid}
            onBlur={onBlur}
            {...props}
        />
        <button
            type="button"
            onClick={() => setCalendarOpen(!isCalendarOpen)}
            className="absolute right-2 bottom-2.5 p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="カレンダーを開く"
        >
            <CalendarIcon className="h-5 w-5" />
        </button>
      {isCalendarOpen && (
        <CalendarPopover
            onDateSelect={handleDateSelect}
            initialDate={selectedDate}
        />
      )}
    </div>
  );
};