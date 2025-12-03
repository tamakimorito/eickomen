import { useReducer, useCallback, useState } from 'react';
import { formReducer } from '../state/formReducer.ts';
import { INITIAL_FORM_DATA } from '../constants.ts';

export const useFormLogic = () => {
    const [formData, dispatch] = useReducer(formReducer, INITIAL_FORM_DATA);
    const [invalidFields, setInvalidFields] = useState([]);

    const handleInputChange = useCallback((e) => {
        const { name, type, value, checked } = e.target;
        const serviceFields = ['proxyElectricity', 'proxyGas', 'proxyWater', 'proxyOil'];
        setInvalidFields(prev => prev.filter(item => item !== name && !(serviceFields.includes(name) && item === 'proxyServices')));
        
        const payloadValue = type === 'checkbox' ? checked : value;
        dispatch({ type: 'UPDATE_FIELD', payload: { name, value: payloadValue, type } });
    }, [dispatch]);

    const resetForm = useCallback((keepApName = true) => {
        dispatch({ type: 'RESET_FORM', payload: { keepApName, apName: formData.apName } });
        setInvalidFields([]);
    }, [dispatch, formData.apName]);

    const handleIdBlur = useCallback((e) => {
        // This function is intentionally left empty here.
        // The actual implementation is in useAppLogic.ts to have access to modal state.
        // It's included here to satisfy the combined context object structure.
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