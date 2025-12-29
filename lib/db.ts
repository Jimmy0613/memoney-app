// src/lib/db.ts
import Dexie, { type Table } from 'dexie';

// 1. 가계부 데이터 구조(Entity) 정의
export interface Transaction {
  id?: number;         // Auto Increment ID
  date: string;        // 날짜 (YYYY-MM-DD)
  amount: number;      // 금액
  category: string;    // 카테고리 (식비, 교통비 등)
  type: 'income' | 'expense'; // 수입 또는 지출
  memo: string;        // 메모
}

// 2. DB 클래스 정의
export class MyMoneyDatabase extends Dexie {
  transactions!: Table<Transaction>;

  constructor() {
    super('MoneyLogDB');
    this.version(1).stores({
      // 인덱싱할 필드들 정의 (조회 성능 향상)
      transactions: '++id, date, category, type'
    });
  }
}

export const db = new MyMoneyDatabase();