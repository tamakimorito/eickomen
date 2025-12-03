import type { FormData } from '../types.ts';

export const generateAgencyCommentLogic = (formData: FormData): string => {
    const {
        recordId,
        apName,
        agencyContractorName,
        agencyMoveDate,
        agencyNewAddress,
        agencyRequestElectricity,
        agencyRequestGas,
        agencyRequestWater,
        agencyRequestOil,
        agencyElectricCompanyName,
        agencyElectricStartDate,
        agencyGasCompanyName,
        agencyGasStartDate,
        agencyGasStartTime,
        agencyWaterStartDate,
        agencyOilCompanyName,
        agencyOilStartDate,
        agencyOilStartTime,
        agencyOilPaymentMethod,
    } = formData;

    const requestedServices = [
        agencyRequestElectricity ? '電気' : null,
        agencyRequestGas ? 'ガス' : null,
        agencyRequestWater ? '水道' : null,
        agencyRequestOil ? '灯油' : null,
    ].filter(Boolean).join('、');

    const lines: string[] = [
        '【代行】',
        `ID：${recordId || ''}`,
        `AP名：${apName || ''}`,
        `契約者名義：${agencyContractorName || ''}`,
        `引っ越し予定日：${agencyMoveDate || ''}`,
        `引っ越し先住所：${agencyNewAddress || ''}`,
        `代行希望：${requestedServices}`,
    ];

    if (agencyRequestElectricity) {
        lines.push(
            '--- 電気 ---',
            `電力会社名：${agencyElectricCompanyName || ''}`,
            `電気利用開始日：${agencyElectricStartDate || ''}`,
        );
    }

    if (agencyRequestGas) {
        lines.push(
            '--- ガス ---',
            `ガス会社名：${agencyGasCompanyName || ''}`,
            `ガス開栓日：${agencyGasStartDate || ''}`,
            `ガス開栓時間：${agencyGasStartTime || ''}`,
        );
    }

    if (agencyRequestWater) {
        lines.push(
            '--- 水道 ---',
            `水道利用開始日：${agencyWaterStartDate || ''}`,
        );
    }

    if (agencyRequestOil) {
        lines.push(
            '--- 灯油 ---',
            `灯油会社名：${agencyOilCompanyName || ''}`,
            `灯油利用開始日：${agencyOilStartDate || ''}`,
            `灯油開栓時間：${agencyOilStartTime || ''}`,
            `灯油支払い方法：${agencyOilPaymentMethod || ''}`,
        );
    }

    return lines.join('\n');
};
