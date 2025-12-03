import type { FormData } from '../types.ts';

export const generateProxyCommentLogic = (formData: FormData): string => {
    const {
        apName,
        contractorName,
        moveInDate,
        address,
        proxyId,
        proxyElectricity,
        proxyGas,
        proxyWater,
        proxyOil,
        proxyElectricCompanyName,
        proxyElectricStartDate,
        proxyGasCompanyName,
        proxyGasStartDate,
        proxyGasStartTime,
        proxyWaterStartDate,
        proxyOilCompanyName,
        proxyOilStartDate,
        proxyOilStartTime,
        proxyOilPaymentMethod,
    } = formData;

    const lines = [
        '【代行】',
        `ID：${proxyId || ''}`,
        `AP名：${apName || ''}`,
        `契約者名義：${contractorName || ''}`,
        `引っ越し予定日：${moveInDate || ''}`,
        `引っ越し先住所：${address || ''}`,
    ];

    const services: string[] = [];

    if (proxyElectricity) {
        services.push(`電気（${proxyElectricCompanyName || ''}／${proxyElectricStartDate || ''}開始）`);
    }
    if (proxyGas) {
        const timeText = proxyGasStartTime ? `／${proxyGasStartTime}` : '';
        services.push(`ガス（${proxyGasCompanyName || ''}／${proxyGasStartDate || ''}${timeText}）`);
    }
    if (proxyWater) {
        services.push(`水道（${proxyWaterStartDate || ''}開始）`);
    }
    if (proxyOil) {
        const timeText = proxyOilStartTime ? `／${proxyOilStartTime}` : '';
        services.push(`灯油（${proxyOilCompanyName || ''}／${proxyOilStartDate || ''}${timeText}／${proxyOilPaymentMethod || ''}）`);
    }

    if (services.length) {
        lines.push(`代行希望：${services.join('、')}`);
    } else {
        lines.push('代行希望：');
    }

    return lines.join('\n');
};
