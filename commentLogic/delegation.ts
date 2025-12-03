import type { FormData } from '../types.ts';

const formatDate = (value: string): string => {
    if (!value) return '';
    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) return value;

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

export const generateDelegationCommentLogic = (formData: FormData): string => {
    const services = [
        formData.delegationNeedsElectricity ? '電気' : null,
        formData.delegationNeedsGas ? 'ガス' : null,
        formData.delegationNeedsWater ? '水道' : null,
        formData.delegationNeedsKerosene ? '灯油' : null,
    ].filter(Boolean);

    const baseLines = [
        '【代行】',
        `ID：${formData.delegationId || ''}`,
        `AP名：${formData.apName || ''}`,
        `契約者名義：${formData.delegationContractorName || ''}`,
        `引っ越し予定日：${formatDate(formData.delegationMoveDate)}`,
        `引っ越し先住所：${formData.delegationNewAddress || ''}`,
        `代行希望：${services.join('・')}`,
    ];

    if (formData.delegationNeedsElectricity) {
        baseLines.push(
            '',
            '▼電気',
            `電力会社名：${formData.delegationElectricCompany || ''}`,
            `電気利用開始日：${formatDate(formData.delegationElectricStartDate)}`,
        );
    }

    if (formData.delegationNeedsGas) {
        baseLines.push(
            '',
            '▼ガス',
            `ガス会社名：${formData.delegationGasCompany || ''}`,
            `ガス開栓日：${formatDate(formData.delegationGasStartDate)}`,
            `ガス開栓時間：${formData.delegationGasTimeSlot || ''}`,
        );
    }

    if (formData.delegationNeedsWater) {
        baseLines.push(
            '',
            '▼水道',
            `水道利用開始日：${formatDate(formData.delegationWaterStartDate)}`,
        );
    }

    if (formData.delegationNeedsKerosene) {
        baseLines.push(
            '',
            '▼灯油',
            `灯油会社名：${formData.delegationKeroseneCompany || ''}`,
            `灯油利用開始日：${formatDate(formData.delegationKeroseneStartDate)}`,
            `灯油開栓時間：${formData.delegationKeroseneTimeSlot || ''}`,
            `灯油支払い方法：${formData.delegationKerosenePayment || ''}`,
        );
    }

    return baseLines.join('\n');
};
