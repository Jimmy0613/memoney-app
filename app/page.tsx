"use client";

import {useState} from "react";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

const CATEGORIES = ['식비', '교통', '쇼핑', '의료', '기타', '수입'];
// 차트 색상 팔레트
const CATEGORY_COLORS: Record<string, string> = {
  '식비': '#FF6B6B',
  '교통': '#4D96FF',
  '쇼핑': '#FFD93D',
  '의료': '#6BCB77',
  '기타': '#929292'
};

const DEFAULT_COLOR = '#CCCCCC';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");
    const [newTransaction, setNewTransaction] = useState({
        amount: '',
        category: CATEGORIES[0], // '식비'가 기본값으로 선택됨
        type: 'expense' as 'expense' | 'income',
        date: new Date().toISOString().split('T')[0],
    });

    // DB에서 데이터 실시간 조회 (자바의 ObservableList 같은 느낌)
    const transactions = useLiveQuery(() => db.transactions.toArray());

    // 1. 수입 합계 계산
    const totalIncome = transactions
        ? transactions
            .filter((t) => t.type === 'income')
            .reduce((acc, cur) => acc + cur.amount, 0)
        : 0;

    // 2. 지출 합계 계산
    const totalExpense = transactions
        ? transactions
            .filter((t) => t.type === 'expense')
            .reduce((acc, cur) => acc + cur.amount, 0)
        : 0;


    // 데이터 저장 함수
    const handleSave = async () => {
        if (!amount || isNaN(Number(amount))) {
            alert("금액을 정확히 입력해주세요.");
            return;
        }

        await db.transactions.add({
            date: new Date().toISOString(),
            amount: Number(amount),
            category: newTransaction.category, //임시
            type: 'expense',
            memo: memo
        });

        // 초기화 및 닫기
        setAmount("");
        setMemo("");
        setIsModalOpen(false);
    };

    // 1. 데이터 가공: 카테고리별 합계 계산 (Java의 Stream.groupingBy 같은 역할)
    const chartData: ChartData[] = transactions ? Object.values(
        transactions.reduce((acc: Record<string, ChartData>, cur) => {
            if (cur.type === 'expense') {
                if (!acc[cur.category]) {
                    acc[cur.category] = {name: cur.category, value: 0};
                }
                acc[cur.category].value += cur.amount;
            }
            return acc;
        }, {})
    ) : [];

    return (
        <div className="p-4 flex flex-col gap-6">
            <header className="flex justify-between items-center py-2">
                <h1 className="text-xl font-bold">나의 가계부</h1>
                <div className="flex gap-2">
                    <button onClick={exportData} className="text-xs bg-gray-200 px-2 py-1 rounded cursor-pointer">내보내기
                    </button>
                    <label
                        className="text-xs bg-gray-200 px-2 py-1 rounded cursor-pointer flex items-center justify-center">
                        가져오기
                        <input type="file" accept=".json" onChange={importData} className="hidden"/>
                    </label>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2 bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md"
                    >
                        +
                    </button>
                </div>
            </header>

            {/* 상단 대시보드 카드 */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-blue-100 text-sm">전체 잔액</p>
                        <h2 className="text-3xl font-bold mt-1">
                            {(totalIncome - totalExpense).toLocaleString()}원
                        </h2>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                        💰
                    </div>
                </div>

                <div className="flex gap-4 border-t border-white/20 pt-4 mt-2">
                    <div className="flex-1">
                        <p className="text-blue-200 text-xs">이번 달 수입</p>
                        <p className="font-semibold text-lg">+{totalIncome.toLocaleString()}</p>
                    </div>
                    <div className="w-px bg-white/20 h-10"></div>
                    <div className="flex-1 text-right">
                        <p className="text-blue-200 text-xs text-right">이번 달 지출</p>
                        <p className="font-semibold text-lg">-{totalExpense.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            {/* 차트 섹션 */}
            {chartData.length > 0 && (
                <section className="bg-white p-4 rounded-2xl shadow-sm border">
                    <h3 className="font-semibold mb-4 text-gray-500">지출 카테고리</h3>
                    <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData as any[]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60} // 도넛 모양
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip/>
                                <Legend/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            )}

            {/* 리스트 출력 */}
            <section>
                <h3 className="font-semibold mb-3 text-gray-500">최근 내역</h3>
                <div className="flex flex-col gap-4">
                    <ul>
                        {transactions?.map((t) => (
                            <li key={t.id}
                                className="flex justify-between items-center p-3 border-b last:border-0 group">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{t.category}</span>
                                    <span
                                        className="text-xs text-gray-400">{new Date(t.date).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${t.type === 'income' ? 'text-blue-500' : 'text-red-500'}`}>
                                      {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}원
                                    </span>
                                    {/* 삭제 버튼 */}
                                    <button
                                        onClick={() => {
                                            if (confirm('정말 삭제하시겠습니까?')) db.transactions.delete(t.id!);
                                        }}
                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
                                             viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round"
                                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                        </svg>
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {transactions?.length === 0 &&
                        <p className="text-center text-gray-400 py-10">내역이 없습니다. + 버튼을 눌러보세요!</p>}
                </div>
            </section>

            {/*입력 모달 (간이 UI)*/}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
                        <h2 className="text-lg font-bold mb-4">내역 추가</h2>
                        {/* 카테고리 입력 부분 */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">카테고리</label>
                            <select
                                className="w-full p-3 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                value={newTransaction.category}
                                onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-4">
                            <input
                                type="number"
                                placeholder="금액 입력"
                                className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="어디에 쓰셨나요? (메모)"
                                className="p-3 border rounded-xl outline-none focus:border-blue-500"
                                value={memo}
                                onChange={(e) => setMemo(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 p-3 bg-gray-100 rounded-xl font-medium"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="flex-1 p-3 bg-blue-600 text-white rounded-xl font-medium"
                                >
                                    저장하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// 데이터 내보내기 함수
const exportData = async () => {
    const allData = await db.transactions.toArray();
    const dataString = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataString], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `memoney-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// 데이터 가져오기 함수
const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const json = JSON.parse(e.target?.result as string);

            if (confirm("기존 데이터에 추가하시겠습니까? (중복 데이터가 생길 수 있습니다.)")) {
                // ID를 제외하고 삽입 (Auto Increment를 위해)
                const dataToImport = json.map(({id, ...rest}: any) => rest);
                await db.transactions.bulkAdd(dataToImport);
                alert("데이터를 성공적으로 가져왔습니다!");
            }
        } catch (err) {
            alert("파일 형식이 올바르지 않습니다.");
        }
    };
    reader.readAsText(file);
}