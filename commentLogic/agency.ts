import type { FormData } from '../types.ts';

const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    }
    return dateStr;
};

export const generateAgencyCommentLogic = (formData: FormData): string => {
    const {
        agencyId,
        agencyApName,
        agencyContractorName,
        agencyMoveDate,
        agencyNewAddress,
        agencyElectricity,
        agencyGas,
        agencyWater,
        agencyKerosene,
        agencyElectricityCompany,
        agencyElectricityStartDate,
        agencyGasCompany,
        agencyGasStartDate,
        agencyGasTimeSlot,
        agencyWaterStartDate,
        agencyKeroseneCompany,
        agencyKeroseneStartDate,
        agencyKeroseneTimeSlot,
        agencyKerosenePaymentMethod,
    } = {
        ...formData,
        agencyMoveDate: formatDate(formData.agencyMoveDate),
        agencyElectricityStartDate: formatDate(formData.agencyElectricityStartDate),
        agencyGasStartDate: formatDate(formData.agencyGasStartDate),
        agencyWaterStartDate: formatDate(formData.agencyWaterStartDate),
        agencyKeroseneStartDate: formatDate(formData.agencyKeroseneStartDate),
    };

    const selectedServices: string[] = [];
    const serviceDetails: string[] = [];

    if (agencyElectricity) {
        selectedServices.push('電気');
        serviceDetails.push(`【電気】電力会社名：${agencyElectricityCompany || ''}／電気利用開始日：${agencyElectricityStartDate || ''}`);
    }

    if (agencyGas) {
        selectedServices.push('ガス');
        serviceDetails.push(`【ガス】ガス会社名：${agencyGasCompany || ''}／ガス開栓日：${agencyGasStartDate || ''}／ガス開栓時間：${agencyGasTimeSlot || ''}`);
    }

    if (agencyWater) {
        selectedServices.push('水道');
        serviceDetails.push(`【水道】水道利用開始日：${agencyWaterStartDate || ''}`);
    }

    if (agencyKerosene) {
        selectedServices.push('灯油');
        serviceDetails.push(`【灯油】灯油会社名：${agencyKeroseneCompany || ''}／灯油利用開始日：${agencyKeroseneStartDate || ''}／灯油開栓時間：${agencyKeroseneTimeSlot || ''}／灯油支払い方法：${agencyKerosenePaymentMethod || ''}`);
    }

    const lines = [
        '【代行】',
        `ID：${agencyId || ''}`,
        `AP名：${agencyApName || ''}`,
        `契約者名義：${agencyContractorName || ''}`,
        `引っ越し予定日：${agencyMoveDate || ''}`,
        `引っ越し先住所：${agencyNewAddress || ''}`,
        `代行希望：${selectedServices.join('・')}`,
        ...serviceDetails,
    ];

    return lines.join('\n');
};
