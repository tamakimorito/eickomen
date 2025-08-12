import React, { useContext } from 'https://esm.sh/react@^19.1.0';
import { AppContext } from '../context/AppContext.tsx';
import { FormInput, FormCheckbox } from './FormControls.tsx';
import { HomeModernIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/outline';

const OwnerInfo = ({ isChintai }) => {
  const { formData, handleInputChange, invalidFields } = useContext(AppContext);
  
  return (
    <div className="border-t-2 border-dashed border-blue-300 pt-6 mt-6 space-y-4">
      <h3 className="text-lg font-bold text-blue-700 flex items-center gap-2">
        <HomeModernIcon className="h-6 w-6" />
        {isChintai ? '管理会社情報' : 'オーナー情報（ファミリープラン用）'}
      </h3>
      {isChintai ? (
        <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-200 space-y-4">
           <p className="text-sm text-red-600 font-bold">ファミリータイプはオーナー確認①②③必須！</p>
            <FormInput
              label="①管理会社名"
              name="managementCompany"
              value={formData.managementCompany}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('managementCompany')}
              required
            />
            <FormInput
              label="②管理連絡先"
              name="managementContact"
              value={formData.managementContact}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('managementContact')}
              required
            />
            <FormInput
              label="③担当者名"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('contactPerson')}
              required
            />
            <FormInput
              label="④ビル調査希望"
              name="buildingSurveyRequest"
              value={formData.buildingSurveyRequest}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('buildingSurveyRequest')}
            />
            <FormInput
              label="⑤図面提出方法と送付先"
              name="drawingSubmissionContact"
              value={formData.drawingSubmissionContact}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('drawingSubmissionContact')}
            />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50/50 rounded-lg border border-blue-200">
            <FormInput
              label="管理会社"
              name="managementCompany"
              value={formData.managementCompany}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('managementCompany')}
            />
            <FormInput
              label="管理番号"
              name="managementNumber"
              value={formData.managementNumber}
              onChange={handleInputChange}
              isInvalid={invalidFields.includes('managementNumber')}
            />
            <FormInput
              label="担当者"
              name="contactPerson"
              value={formData.contactPerson}
              onChange={handleInputChange}
              className="md:col-span-2"
              isInvalid={invalidFields.includes('contactPerson')}
            />
            <div className="md:col-span-2 space-y-4">
                <FormCheckbox
                    label="穴あけ・ビス止めNG"
                    name="noDrilling"
                    checked={formData.noDrilling}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('noDrilling')}
                    description=""
                />
                <FormCheckbox
                    label="図面提出あり"
                    name="drawingSubmission"
                    checked={formData.drawingSubmission}
                    onChange={handleInputChange}
                    isInvalid={invalidFields.includes('drawingSubmission')}
                    description=""
                />
                 {formData.drawingSubmission && (
                    <FormInput
                        label="FAX番号または郵送先"
                        name="drawingSubmissionContact"
                        value={formData.drawingSubmissionContact}
                        onChange={handleInputChange}
                        placeholder="FAX: 03-XXXX-XXXX または 郵送先住所"
                        required={formData.drawingSubmission}
                        isInvalid={invalidFields.includes('drawingSubmissionContact')}
                    />
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default OwnerInfo;