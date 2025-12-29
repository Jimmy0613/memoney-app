"use client";

import {useState} from "react";
import {db} from "@/lib/db";
import {useLiveQuery} from "dexie-react-hooks";
import {PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip} from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [amount, setAmount] = useState("");
    const [memo, setMemo] = useState("");

    // DB에서 데이터 실시간 조회 (자바의 ObservableList 같은 느낌)
    const transactions = useLiveQuery(() => db.transactions.reverse().toArray());

    // 데이터 저장 함수
    const handleSave = async () => {
        if (!amount || !memo) return alert("내용을 입력해주세요!");

        await db.transactions.add({
            date: new Date().toISOString().split('T')[0],
            amount: Number(amount),
            category: '식비', //임시
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

    // 차트 색상 팔레트
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

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

            {/* 잔액 요약 (나중에 실제 합계로 로직 추가) */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-400 p-6 rounded-2xl text-white shadow-md">
                <p className="text-sm opacity-80">이번 달 사용 금액</p>
                <h2 className="text-3xl font-bold mt-1">
                    {transactions?.reduce((acc, cur) => acc + cur.amount, 0).toLocaleString()}원
                </h2>
            </section>

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
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
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
                    {transactions?.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 border-b">
                            <div>
                                <p className="font-medium">{item.memo}</p>
                                <p className="text-xs text-gray-400">{item.date} · {item.category}</p>
                            </div>
                            <p className={item.type === 'expense' ? 'text-red-500 font-semibold' : 'text-blue-500 font-semibold'}>
                                {item.type === 'expense' ? '-' : '+'}{item.amount.toLocaleString()}원
                            </p>
                        </div>
                    ))}
                    {transactions?.length === 0 &&
                        <p className="text-center text-gray-400 py-10">내역이 없습니다. + 버튼을 눌러보세요!</p>}
                </div>
            </section>

            {/*입력 모달 (간이 UI)*/}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
                    <div className="bg-white w-full max-w-md rounded-t-3xl p-6 animate-slide-up">
                        <h2 className="text-lg font-bold mb-4">내역 추가</h2>
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