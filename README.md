# 💰 나만의 PWA 가계부 (MeMoney)

> **Next.js 15 + Dexie.js(IndexedDB) + Tailwind CSS**로 제작된 설치형 웹 가계부입니다.
> 서버 없이 브라우저 로컬 DB를 사용하여 개인정보가 안전하게 보호됩니다.

## 🚀 주요 기능
- **PWA 지원**: 앱스토어 없이 홈 화면에 설치하여 앱처럼 사용 가능
- **오프라인 우선**: 인터넷 연결 없이도 내역 입력 및 조회 가능
- **시각화**: Recharts를 활용한 카테고리별 지출 통계 제공
- **로컬 스토리지**: 모든 데이터는 사용자의 기기에만 저장 (Privacy First)

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Dexie.js (IndexedDB Wrapper)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **Deployment**: Cloudflare Pages
- **CI/CD**: GitHub Actions 기반 자동 배포

## 📱 미리보기
- **잔액 현황 카드**: 수입/지출 실시간 요약
- **도넛 차트**: 카테고리별 지출 비율 확인
- **내역 관리**: 메모가 포함된 상세 내역 리스트 및 삭제 기능
- **데이터 내보내기/가져오기**: 로컬 데이터를 json 파일로 내보내고, 백업 json 파일을 가져오는 기능
