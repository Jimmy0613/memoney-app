"use client";

import { db } from "@/lib/db";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  // 내보내기 로직
  const handleExport = async () => {
    const allData = await db.transactions.toArray();
    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `money-log-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 가져오기 로직
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (confirm("기존 데이터가 유지된 채 새로운 데이터가 추가됩니다. 진행하시겠습니까?")) {
          const dataToImport = data.map(({id, ...rest}: any) => rest);
          await db.transactions.bulkAdd(dataToImport);
          alert("데이터를 성공적으로 가져왔습니다!");
          router.refresh();
        }
      } catch (err) {
        alert("파일 형식이 잘못되었습니다.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 p-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-200 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold">설정</h1>
      </div>

      <div className="space-y-6">
        {/* 데이터 관리 섹션 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 ml-1">데이터 관리</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <button
              onClick={handleExport}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">📤</span>
                <span className="font-medium text-gray-700">데이터 내보내기 (JSON)</span>
              </div>
              <span className="text-gray-400 text-sm font-bold">〉</span>
            </button>

            <label className="w-full flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-xl">📥</span>
                <span className="font-medium text-gray-700">데이터 가져오기</span>
              </div>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              <span className="text-gray-400 text-sm font-bold">〉</span>
            </label>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 px-2">
            * 기기를 변경하거나 데이터를 백업할 때 사용하세요.
          </p>
        </section>

        {/* 버전 정보 등 추가 가능 */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 mb-3 ml-1">정보</h2>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex justify-between">
            <span className="text-gray-700 font-medium">버전 정보</span>
            <span className="text-gray-400 font-bold text-sm">v1.0.0</span>
          </div>
        </section>
      </div>
    </div>
  );
}