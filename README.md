# KCCEPT iOS PWA starter

Mac 없이 iPhone에서 홈 화면 앱처럼 실행하는 KCCEPT 프로토타입입니다.

## 현재 구현
- PDF 파일 열기 및 페이지 렌더링 (PDF.js)
- PPTX 파일 로컬 렌더링 (Web-PPT `@web-ppt/core`)
- 이전/다음 페이지, 페이지 번호 직접 입력
- 화면 스와이프 페이지 이동
- 브라우저 전체 화면 요청
- 홈 화면 추가용 웹 앱 매니페스트 및 기본 서비스 워커
- 파일은 브라우저 안에서 처리하며 별도 서버로 업로드하지 않음

## 실행 방법
PWA는 HTTPS 주소에서 설치해야 합니다. GitHub Pages 또는 Netlify에 이 폴더의 파일을 배포하세요.

### GitHub Pages 예시
1. GitHub에서 새 저장소를 만듭니다.
2. 이 폴더 안의 파일 5개를 저장소 루트에 업로드합니다.
3. 저장소의 Settings → Pages → Deploy from a branch → `main` / `/ (root)`를 선택합니다.
4. 생성된 HTTPS 주소를 iPhone Safari에서 엽니다.
5. 공유 버튼 → 홈 화면에 추가를 선택합니다.

## iPhone에서 확인할 사항
- PDF/PPTX 렌더링은 최신 iOS Safari에서 테스트해야 합니다.
- PPTX의 일부 고급 애니메이션, 전환, 특수 글꼴, 임베디드 미디어는 원본 PowerPoint와 다르게 보일 수 있습니다.
- 이 PWA는 외부 모니터에 별도 화면을 내보내는 네이티브 iOS 앱이 아닙니다. HDMI/AirPlay는 우선 iPhone 화면 미러링 방식으로 동작합니다.
- 브라우저 기반 앱은 인터넷 연결이 필요합니다(렌더링 라이브러리를 CDN에서 가져옵니다). 파일 내용은 기기에서 처리합니다.
- 정식 App Store 앱으로 배포하려면 이후 Apple 개발자 계정 및 Mac 또는 클라우드 macOS 빌드 환경이 필요합니다.

## 참고 기술
- PDF.js: https://mozilla.github.io/pdf.js/
- Web-PPT: https://unstone.github.io/web-ppt/index.en.html
