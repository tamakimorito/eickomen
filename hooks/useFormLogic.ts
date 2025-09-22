import { useReducer, useCallback, useState } from 'react';
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

    const resetForm = useCallback((keepApName = true) => {
        dispatch({ type: 'RESET_FORM', payload: { keepApName, apName: formData.apName } });
        setInvalidFields([]);
    }, [dispatch, formData.apName]);

    const handleIdBlur = useCallback(() => {
        // dispatch({ type: 'UPDATE_DERIVED_FIELDS_FROM_ID' });
        // This logic is now handled inside the main formReducer for consistency.
    }, []);

    return {
        formData,
        dispatch,
        invalidFields,
        setInvalidFields,
        handleInputChange,
        resetForm,
        handleIdBlur,
    };
};