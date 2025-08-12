import React, { useContext } from 'https://esm.sh/react@^19.1.0';
import { AppContext } from './context/AppContext.tsx';
import InternetTab from './components/InternetTab.tsx';
import ElectricityTab from './components/ElectricityTab.tsx';
import GasTab from './components/GasTab.tsx';
import WtsTab from './components/WtsTab.tsx';
import GeneratedComment from './components/GeneratedComment.tsx';
import Header from './components/Header.tsx';
import { Toast } from './components/Toast.tsx';
import { Modal } from './components/Modal.tsx';
import ManualModal from './components/ManualModal.tsx';
import BugReportModal from './components/BugReportModal.tsx';
import { FormInput, FormCheckbox } from './components/FormControls.tsx';
import { BoltIcon, FireIcon, WifiIcon, CloudIcon, ChatBubbleBottomCenterTextIcon } from 'https://esm.sh/@heroicons/react@^2.2.0/24/solid';

const TABS = [
  { id: 'electricity', label: '電気', icon: BoltIcon },
  { id: 'gas', label: 'ガス', icon: FireIcon },
  { id: 'internet', label: 'インターネット', icon: WifiIcon },
  { id: 'wts', label: 'ウォーターサーバー', icon: CloudIcon },
];

const Tab = ({ id, label, icon: Icon, activeTab, onTabChange }) => (
    <button
        onClick={() => onTabChange(id)}
        className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm sm:text-base font-bold transition-colors duration-200 ease-in-out focus:outline-none -mb-px ${
            activeTab === id
            ? 'text-blue-700 border-b-4 border-blue-700'
            : 'text-gray-500 hover:text-blue-600 border-b-4 border-transparent'
        }`}
    >
        <Icon className="h-5 w-5"/>
        <span className="hidden sm:inline">{label}</span>
    </button>
);


const App = () => {
    const {
        formData,
        handleInputChange,
        invalidFields,
        toast,
        setToast,
        modalState,
        isManualOpen,
        setIsManualOpen,
        isBugReportOpen,
        bugReportState,
        handleBugReportTextChange,
        handleOpenBugReport,
        handleCloseBugReport,
        handleBugReportSubmit,
        activeTab,
        onTabChange,
        handleResetRequest,
    } = useContext(AppContext);

    return (
        <div className="bg-gray-100 min-h-screen font-sans">
            <Header onManualOpen={() => setIsManualOpen(true)} onResetRequest={handleResetRequest} />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            
            <Modal {...modalState} />
            <ManualModal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
            <BugReportModal 
                isOpen={isBugReportOpen}
                onClose={handleCloseBugReport}
                reportText={bugReportState.text}
                onReportTextChange={handleBugReportTextChange}
                onSubmit={handleBugReportSubmit}
                isSubmitting={bugReportState.isSubmitting}
                isInvalid={bugReportState.isInvalid}
            />

            <main className="max-w-7xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                            <FormInput
                                label="担当者/AP名"
                                name="apName"
                                value={formData.apName}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('apName')}
                                required
                                className="w-1/2"
                            />
                             <FormCheckbox
                                label="サカイ販路"
                                name="isSakaiRoute"
                                checked={formData.isSakaiRoute}
                                onChange={handleInputChange}
                                isInvalid={invalidFields.includes('isSakaiRoute')}
                                description=""
                                className="pt-6"
                            />
                        </div>
                        <div className="border-b-2 border-gray-200">
                            <nav className="flex space-x-2 sm:space-x-4">
                                {TABS.map(tab => <Tab key={tab.id} {...tab} activeTab={activeTab} onTabChange={onTabChange} />)}
                            </nav>
                        </div>
                        <div className="mt-6 space-y-6">
                            {activeTab === 'electricity' && <ElectricityTab />}
                            {activeTab === 'gas' && <GasTab />}
                            {activeTab === 'internet' && <InternetTab />}
                            {activeTab === 'wts' && <WtsTab />}
                        </div>
                    </div>

                    <div className="sticky top-24 self-start">
                        <GeneratedComment />
                    </div>
                </div>
            </main>
            
            <button
                onClick={handleOpenBugReport}
                className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                aria-label="不具合・要望の報告"
            >
                <ChatBubbleBottomCenterTextIcon className="h-7 w-7" />
            </button>
        </div>
    );
};

export default App;