// 기존에 정상 작동하는 화면 진입 효과. 기능 추가 시 유지한다.
document.documentElement.classList.add('has-js');
const revealSections = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealSections.forEach((section) => observer.observe(section));
} else {
  revealSections.forEach((section) => section.classList.add('is-visible'));
}

const compareSection = document.querySelector('.compare-section');
const yearButtonA = compareSection.querySelector('.year-button-a');
const yearButtonB = compareSection.querySelector('.year-button-b');
const yearRate = compareSection.querySelector('.year-rate');
const yearLabel = compareSection.querySelector('.year-label');
const metricTitle = compareSection.querySelector('.metric-title');
const yearDescription = compareSection.querySelector('.year-description');
const yearChart = compareSection.querySelector('.year-chart');
const chartPeriod = compareSection.querySelector('.chart-footer span:first-child');
const chartStatus = compareSection.querySelector('.chart-status');
const practiceMessage = compareSection.querySelector('.practice-message');
const yearButtons = [yearButtonA, yearButtonB];

const yearContent = {
  a: {
    label: 'YEAR A',
    name: '연도 A',
    rate: '4.2',
    title: '연도 A의 실업률 변화',
    description: '연도 A를 선택한 초기 화면입니다. 학습용 수치를 기반으로 그래프와 설명이 표시됩니다.',
    image: 'images/year-a.svg',
    imageAlt: '가상 데이터 연도 A 실업률 추이 그래프',
  },
  b: {
    label: 'YEAR B',
    name: '연도 B',
    rate: '3.6',
    title: '연도 B의 실업률 변화',
    description: '연도 B를 선택한 화면입니다.',
    image: 'images/year-b.svg',
    imageAlt: '가상 데이터 연도 B 실업률 추이 그래프',
  },
};

function showYear(year) {
  const content = yearContent[year];
  const isYearA = year === 'a';

  yearRate.firstChild.textContent = content.rate;
  yearLabel.textContent = content.label;
  metricTitle.textContent = content.title;
  yearDescription.textContent = content.description;
  yearChart.src = content.image;
  yearChart.alt = content.imageAlt;
  chartPeriod.textContent = content.name;
  chartStatus.textContent = `${content.name} 그래프가 표시 중입니다.`;
  practiceMessage.textContent = `현재 ${content.name}의 학습용 가상 데이터가 표시 중입니다.`;

  yearButtons.forEach((button, index) => {
    const isSelected = index === (isYearA ? 0 : 1);
    button.classList.toggle('active', isSelected);
    button.setAttribute('aria-pressed', String(isSelected));
  });
}

yearButtonA.addEventListener('click', () => showYear('a'));
yearButtonB.addEventListener('click', () => showYear('b'));
showYear('a');
