import { useReducer, useCallback, useState } from 'https://esm.sh/react@^19.1.0';
import { formReducer } from '../state/formReducer.ts';
import { INITIAL_FORM_DATA } from '../constants.ts';

export const useFormLogic = () => {
    const [formData, dispatch] = useReducer(formReducer, INITIAL_FORM_DATA);
    const [invalidFields, setInvalidFields] = useState([]);

    const handleInputChange = useCallback((e) => {
        const { name, type, value, checked } = e.target;
        setInvalidFields(prev => prev.filter(item => item !== name));
        
        const payloadValue = type === 'checkbox' ? checked : value;
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: payloadValue, type } });
    }, [dispatch]);

    const handleDateBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value) return;

        let processedValue = value;
        
        // Prioritize M/D or MM/DD format
        const match = value.match(/^(?<month>\d{1,2})\/(?<day>\d{1,2})$/);
        if (match?.groups) {
            const { month, day } = match.groups;
            const m = parseInt(month, 10);
            const d = parseInt(day, 10);

            if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
                const today = new Date();
                const currentYear = today.getFullYear();
                
                // Always use the current year. The check for past dates will be handled on copy.
                const targetDate = new Date(currentYear, m - 1, d);

                // Check if date is valid (e.g. not 2/30 which would become 3/1 or 3/2)
                if (targetDate.getMonth() === m - 1) {
                    processedValue = `${targetDate.getFullYear()}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
                }
            }
        } else {
            // Handle full dates like YYYY/MM/DD or other parsable formats
            const targetDate = new Date(value);
            // Check if the date is valid to avoid formatting "Invalid Date"
            if (!isNaN(targetDate.getTime())) {
                processedValue = `${targetDate.getFullYear()}/${String(targetDate.getMonth() + 1).padStart(2, '0')}/${String(targetDate.getDate()).padStart(2, '0')}`;
            }
        }

        if (processedValue !== value) {
            dispatch({ type: 'UPDATE_FIELD', payload: { name, value: processedValue } });
        }
    }, [dispatch]);

    const resetForm = useCallback((keepApName = true) => {
        dispatch({ type: 'RESET_FORM', payload: { keepApName, apName: formData.apName } });
        setInvalidFields([]);
    }, [dispatch, formData.apName]);

    const handleNameBlur = useCallback((e) => {
        const { name, value } = e.target;
        if (!value) return;

        const hasNumber = /\d/.test(value);
        const isKanaField = name.toLowerCase().includes('kana');

        if (isKanaField) {
            const isNotKana = /[^\u30A0-\u30FF\u3000\s]/.test(value); 
            if (isNotKana) {
                console.warn(`Validation Warning: Non-Kana characters in ${name}: "${value}"`);
                return;
            }
        }

        if (hasNumber && !isKanaField) {
            console.warn(`Validation Warning: Numbers in name field ${name}: "${value}"`);
        }
    }, []);

    const handleIdBlur = useCallback(() => {
        dispatch({ type: 'UPDATE_DERIVED_FIELDS_FROM_ID' });
    }, [dispatch]);

    return {
        formData,
        dispatch,
        invalidFields,
        setInvalidFields,
        handleInputChange,
        handleDateBlur,
        handleNameBlur,
        resetForm,
        handleIdBlur,
    };
};