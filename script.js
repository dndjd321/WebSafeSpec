// script.js 파일 - 최종 (2가지 다운로드 옵션 제공, 초기화 안내 문구 제거)

// 1. JSON 데이터를 JavaScript 변수로 직접 정의
const specs = [
    { "id": "insta_square", "name": "인스타그램 게시물 (정사각형 1:1)", "platform": "Instagram", "target_width": 1080, "target_height": 1080, "description": "가장 기본적인 1:1 비율입니다. 해상도는 1080x1080px 권장." },
    { "id": "insta_portrait", "name": "인스타그램 게시물 (세로 4:5)", "platform": "Instagram", "target_width": 1080, "target_height": 1350, "description": "피드에서 가장 큰 영역을 차지하는 세로형 비율입니다." },
    { "id": "naver_smartstore_main", "name": "스마트스토어 대표 이미지 (1:1)", "platform": "Naver Smartstore", "target_width": 1000, "target_height": 1000, "description": "검색 및 쇼핑 탭에 노출되는 기본 규격입니다. 최소 640px." },
    { "id": "kakao_channel_logo", "name": "카카오 채널 프로필/로고", "platform": "KakaoTalk Channel", "target_width": 400, "target_height": 400, "description": "최적의 프로필 이미지 크기입니다. 정사각형으로 제작해야 합니다." },
    { "id": "youtube_thumbnail", "name": "유튜브 썸네일 (16:9)", "platform": "YouTube", "target_width": 1280, "target_height": 720, "description": "유튜브 영상에 최적화된 표준 썸네일 규격입니다." }
];


// 2. DOM 요소 가져오기
const specSelect = document.getElementById('specSelect');
const outputResult = document.getElementById('outputResult');
const targetSpecDiv = document.getElementById('targetSpec');
const calculatedSizeDiv = document.getElementById('calculatedSize');
const imageUpload = document.getElementById('imageUpload');
const currentSizeSpan = document.getElementById('currentSize');
const imagePreview = document.getElementById('imagePreview');
const noImageText = document.getElementById('noImageText');
const fileNameDisplay = document.getElementById('fileNameDisplay'); 
// ✨ 두 개의 다운로드 버튼 DOM 추가
const downloadContainButton = document.getElementById('downloadContainButton'); 
const downloadStretchButton = document.getElementById('downloadStretchButton'); 


// 전역 변수로 현재 이미지 크기를 저장합니다.
let currentImageWidth = 0;
let currentImageHeight = 0;


// 3. 규격 드롭다운 채우기 (변경 없음)
function populateSpecs() {
    if (!specSelect) return;
    specs.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec.id;
        option.textContent = `[${spec.platform}] ${spec.name}`;
        specSelect.appendChild(option);
    });
}


// 4. 이미지 파일 업로드 핸들러 (변경 없음)
function handleImageUpload(event) {
    if (!imageUpload || !currentSizeSpan || !fileNameDisplay) return;
    const file = event.target.files[0];
    
    // 파일 유효성 검사 및 초기화
    if (!file || !file.type.startsWith('image/')) {
        currentSizeSpan.textContent = "--";
        fileNameDisplay.textContent = "선택된 파일 없음";
        
        if (imagePreview) imagePreview.style.display = 'none';
        if (noImageText) noImageText.style.display = 'block';
        
        currentImageWidth = 0;
        currentImageHeight = 0;
        
        calculateSize(); 
        return;
    }

    fileNameDisplay.textContent = file.name;

    const reader = new FileReader();

    reader.onload = function(e) {
        // 미리보기 표시
        if (imagePreview) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; 
        }
        if (noImageText) noImageText.style.display = 'none';

        const img = new Image();
        img.onload = function() {
            currentImageWidth = this.width;
            currentImageHeight = this.height;
            currentSizeSpan.innerHTML = `**${this.width}px (가로) X ${this.height}px (세로)**`;
            
            calculateSize();
        };
        img.src = e.target.result;
    };

    reader.readAsDataURL(file);
}


// ✨ 5. 리사이즈 및 다운로드 함수 1: 내용 보존 (Contain / 여백 채우기)
function resizeAndDownloadContain() {
    const selectedId = specSelect.value;
    const selectedSpec = specs.find(spec => spec.id === selectedId);
    
    if (currentImageWidth === 0 || currentImageHeight === 0 || !selectedSpec) {
        alert("이미지 파일을 업로드하고 규격을 선택해야 다운로드할 수 있습니다.");
        return;
    }
    
    const targetWidth = selectedSpec.target_width;
    const targetHeight = selectedSpec.target_height;
    
    const imgElement = document.getElementById('imagePreview');
    if (!imgElement || imgElement.style.display === 'none') {
        alert("이미지 로드에 실패했습니다. 다시 업로드해 주세요.");
        return;
    }
    
    // 1. Canvas 생성 (최종 규격 크기로)
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    // 2. 흰색 배경으로 채우기
    ctx.fillStyle = '#ffffff'; 
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    
    // 3. 리사이즈 크기 계산 (비율 유지)
    const widthRatio = targetWidth / currentImageWidth;
    const heightRatio = targetHeight / currentImageHeight;
    
    const ratio = Math.min(widthRatio, heightRatio);
    
    const newWidth = currentImageWidth * ratio;
    const newHeight = currentImageHeight * ratio;
    
    // 4. 이미지 그릴 위치 계산 (중앙 정렬)
    const startX = (targetWidth - newWidth) / 2;
    const startY = (targetHeight - newHeight) / 2;
    
    // 5. 이미지를 Canvas에 그리기
    ctx.drawImage(imgElement, startX, startY, newWidth, newHeight);
    
    // 6. 다운로드 링크 생성
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataURL;
    
    const specName = selectedSpec.id.replace(/_/g, '-');
    link.download = `websafespec-contain-${specName}-${targetWidth}x${targetHeight}.jpg`;
    
    link.click();
}


// ✨ 6. 리사이즈 및 다운로드 함수 2: 강제 채우기 (Stretch / 비율 무시)
function resizeAndDownloadStretch() {
    const selectedId = specSelect.value;
    const selectedSpec = specs.find(spec => spec.id === selectedId);
    
    if (currentImageWidth === 0 || currentImageHeight === 0 || !selectedSpec) {
        alert("이미지 파일을 업로드하고 규격을 선택해야 다운로드할 수 있습니다.");
        return;
    }
    
    const targetWidth = selectedSpec.target_width;
    const targetHeight = selectedSpec.target_height;
    
    const imgElement = document.getElementById('imagePreview');
    if (!imgElement || imgElement.style.display === 'none') {
        alert("이미지 로드에 실패했습니다. 다시 업로드해 주세요.");
        return;
    }
    
    // 1. Canvas 생성 (최종 규격 크기로)
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    
    // 2. 이미지를 Canvas에 그리기 (강제 채우기)
    ctx.drawImage(imgElement, 0, 0, targetWidth, targetHeight);
    
    // 3. 다운로드 링크 생성
    const dataURL = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataURL;
    
    const specName = selectedSpec.id.replace(/_/g, '-');
    link.download = `websafespec-stretch-${specName}-${targetWidth}x${targetHeight}.jpg`;
    
    link.click();
}


// 7. 메인 계산 로직 (가이드 및 버튼 표시)
function calculateSize() {
    if (!specSelect || !outputResult || !targetSpecDiv || !calculatedSizeDiv) return;

    const selectedId = specSelect.value;
    const originalWidth = currentImageWidth;
    const originalHeight = currentImageHeight;

    // 결과 영역 초기화 및 다운로드 버튼 숨기기
    targetSpecDiv.innerHTML = '';
    calculatedSizeDiv.innerHTML = '';
    outputResult.innerHTML = ''; 
    if(downloadContainButton) downloadContainButton.style.display = 'none';
    if(downloadStretchButton) downloadStretchButton.style.display = 'none';

    // 7-2. 최종 유효성 검사
    if (!selectedId || originalWidth === 0 || originalHeight === 0) {
        // ... (유효성 검사 로직 유지) ...
        let errorMsg = '';
        if (!selectedId && originalWidth === 0) {
             errorMsg = '1. 플랫폼 규격과 2. 이미지 파일을 모두 선택(업로드)해 주세요!';
        } else if (!selectedId) {
             errorMsg = '1. 플랫폼 규격을 먼저 선택해 주세요!';
        } else if (originalWidth === 0) {
             errorMsg = '2. 이미지를 먼저 업로드해 주세요!';
        }
        if (!selectedId && originalWidth === 0) {
            initializeApp(); 
            return;
        }
        outputResult.innerHTML = `<p class="error">${errorMsg}</p>`;
        return; 
    }

    const selectedSpec = specs.find(spec => spec.id === selectedId);
    if (!selectedSpec) return; 

    // 7-3. 규격 정보 출력 (변경 없음)
    const targetWidth = selectedSpec.target_width;
    const targetHeight = selectedSpec.target_height;
    
    targetSpecDiv.innerHTML = `
        <p>선택 규격: **${selectedSpec.name}**</p>
        <p>필요한 크기: **${targetWidth}px (가로) X ${targetHeight}px (세로)**</p>
        <p class="small-desc">(${selectedSpec.description})</p>
    `;

    // 7-4. 핵심 리사이즈 가이드 (2가지 옵션 안내)
    const originalRatio = originalWidth / originalHeight;
    const targetRatio = targetWidth / targetHeight;
    
    let ratioStatus = '';
    if (Math.abs(originalRatio - targetRatio) < 0.001) { 
        ratioStatus = `
            <h3>✅ 비율 일치!</h3>
            <p>원본과 타겟 비율이 일치합니다. 두 다운로드 버튼 모두 **왜곡이나 여백 없이** 정확히 리사이즈됩니다.</p>
        `;
    } else {
        ratioStatus = `
            <h3>⚠️ 비율 불일치!</h3>
            <p>원본 비율 (${originalWidth}:${originalHeight})과 타겟 비율 (${targetWidth}:${targetHeight})이 다릅니다.</p>
            <p class="small-desc">아래 두 가지 변환 방식 중 원하는 옵션을 선택하세요:</p>
            <ol style="margin: 10px 0 15px 15px;">
                <li>**내용 보존 버튼:** 원본 내용이 잘리지 않도록 리사이즈 후, 부족한 부분은 흰색 여백으로 채웁니다.</li>
                <li>**강제 채우기 버튼:** 여백 없이 목표 크기에 가득 채우지만, 이미지가 **찌그러지거나 늘어날 수 있습니다.**</li>
            </ol>
        `;
    }

    calculatedSizeDiv.innerHTML = ratioStatus + 
        `<h4>📐 최종 파일 크기:</h4>
        <p>다운로드되는 파일의 캔버스 크기는 다음과 같습니다:</p>
        <p class="final-size-display">**${targetWidth}px (가로) X ${targetHeight}px (세로)**</p>`;
    
    // 계산 결과를 outputResult에 다시 삽입합니다.
    outputResult.appendChild(targetSpecDiv);
    outputResult.appendChild(calculatedSizeDiv);

    // ✨ 계산 성공 시 두 버튼 모두 표시
    if(downloadContainButton && downloadStretchButton) {
        downloadContainButton.style.display = 'block';
        downloadStretchButton.style.display = 'block';
    }
}


// 8. 초기 화면 로직 (버튼 숨기기 포함)
function initializeApp() {
    populateSpecs();
    
    // ⚠️ 수정된 부분: 초기화 텍스트를 제거하고 outputResult 영역을 비워둡니다.
    // index.html에 추가된 "사용 가이드 및 목적" 섹션이 그 역할을 대체합니다.
    if (outputResult) outputResult.innerHTML = `
        <p class="description-text initial-guide">결과를 확인하려면 플랫폼 규격을 선택하고 이미지를 업로드해 주세요.</p>
    `;
    
    if(targetSpecDiv) targetSpecDiv.innerHTML = '';
    if(calculatedSizeDiv) calculatedSizeDiv.innerHTML = '';
    // ✨ 두 버튼 모두 초기 상태에서 숨기기
    if(downloadContainButton) downloadContainButton.style.display = 'none';
    if(downloadStretchButton) downloadStretchButton.style.display = 'none';
}


// 9. 이벤트 리스너 연결 (두 버튼 이벤트 연결)
if (imageUpload) imageUpload.addEventListener('change', handleImageUpload);
if (specSelect) specSelect.addEventListener('change', calculateSize); 

// ✨ 두 개의 다운로드 버튼 이벤트 연결
if (downloadContainButton) downloadContainButton.addEventListener('click', resizeAndDownloadContain); 
if (downloadStretchButton) downloadContainButton.addEventListener('click', resizeAndDownloadStretch); 

// 앱 초기화 실행
document.addEventListener('DOMContentLoaded', initializeApp);