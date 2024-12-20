import "./style.css";
import "cal-heatmap/cal-heatmap.css";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import CalHeatmap from "cal-heatmap";
import CalendarLabel from "cal-heatmap/plugins/CalendarLabel";

const NUMBER_OF_CALENDARS = 4;
const WEEK_START = 1;
const LOCALE = "pt-BR";

i18next
  .use(LanguageDetector)
  .init({
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          "Calendar": "Calendar",
        }
      },
      "pt-BR": {
        translation: {
          "Calendar": "Calendário",
        }
      }
    }
  });

document.querySelector<HTMLDivElement>("#a4-paper")!.innerHTML = `
  <select id="locale-selector">
    <option value="en">English</option>
    <option value="pt-BR">Português (Brasil)</option>
  </select>
  ${Array.from({ length: NUMBER_OF_CALENDARS }, (_, i) => i + 1)
    .map(
      (i) => `
        ${i !== 0 && `<div class="calendar-separator"></div>`}
        <div class="heatmap" id="cal-heatmap-${i}"></div>
      `
    )
    .join("")}
`;

const calendarLabelConfig = {
  width: 30,
  textAlign: "start",
  text: () => getWeekdays().map((d, i) => (i % 2 === 0 ? d : "")),
  padding: [0, 0, 0, 0],
};

const getWeekdays = () => {
  const weekdays: string[] = [];
  const date = new Date();
  for (let i = 0; i < 7; i++) {
    date.setDate(date.getDate() - ((date.getDay() - WEEK_START + 7) % 7) + i);
    weekdays.push(date.toLocaleDateString(LOCALE, { weekday: "short" }));
  }
  return weekdays;
};

function getPaintData(index: number) {
  const squareSize = 15;
  return {
    itemSelector: `#cal-heatmap-${index}`,
    verticalOrientation: false,
    date: {
      start: new Date("02/01/2025"),
      end: new Date("31/12/2025"),
      locale: { weekStart: WEEK_START },
    },
    domain: {
      type: "month",
      label: {
        text: (timeStamp: number) => {
          const date = new Date(timeStamp);
          return date.toLocaleDateString(LOCALE, { month: "long" });
        },
      },
    },
    subDomain: {
      type: "day",
      label: "DD",
      radius: 2,
      height: squareSize,
      width: squareSize,
      color: "#999",
    },
    theme: "light",
  };
}

Array.from({ length: NUMBER_OF_CALENDARS }, (_, i) => i + 1).forEach((i) => {
  const cal = new CalHeatmap();
  cal.paint(getPaintData(i), [[CalendarLabel, calendarLabelConfig]]);
});

const printButton = document.getElementById("print-button")!;

printButton.addEventListener("click", () => {
  document
    .querySelector<HTMLDivElement>("#a4-paper")!
    .classList.add("no-shadow");
  window.print();
  document
    .querySelector<HTMLDivElement>("#a4-paper")!
    .classList.remove("no-shadow");
});

document.getElementById("locale-selector")!.addEventListener("change", (event) => {
  const locale = (event.target as HTMLSelectElement).value;
  i18next.changeLanguage(locale);
  // Update your calendar or other elements based on the new locale
});
