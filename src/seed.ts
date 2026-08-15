import type { Comment, Movie, Translation, User } from "./types";

export const USERS: User[] = [
  { id: "producer-1", name: "Maria Alves", role: "Producer" },
  { id: "reviewer-1", name: "Sara Lindqvist", role: "Reviewer" },
  { id: "translator-1", name: "Aiko Tanaka", role: "Translator", rating: 4.8, absencePeriods: [] },
  { id: "translator-2", name: "Sophie Laurent", role: "Translator", rating: 4.6, absencePeriods: [] },
  { id: "translator-3", name: "Carlos Mendes", role: "Translator", rating: 4.5, absencePeriods: [] },
  { id: "translator-4", name: "Rafael Costa", role: "Translator", rating: 4.9, absencePeriods: [] },
  { id: "translator-5", name: "Luca Bianchi", role: "Translator", rating: 4.3, absencePeriods: [] },
  { id: "translator-6", name: "Ji-hoon Kim", role: "Translator", rating: 4.7, absencePeriods: [] },
];

const REVIEWER = "reviewer-1";

let commentSeq = 0;
function comment(
  author: string,
  authorRole: Comment["authorRole"],
  text: string,
  timestamp: string,
  replies: Comment["replies"] = [],
): Comment {
  commentSeq += 1;
  return { id: `c${commentSeq}`, author, authorRole, text, timestamp, replies };
}

function translation(overrides: Partial<Translation> & { language: string }): Translation {
  return {
    status: "To do",
    assignedTranslatorId: null,
    assignedDate: null,
    daysSpent: 0,
    blockedReason: null,
    translatedText: "",
    method: null,
    comments: [],
    reviewerId: null,
    reviewOutcome: null,
    ...overrides,
  };
}

export function seedMovies(): Movie[] {
  return [
    {
      id: "movie-1",
      title: "Crimson Tide",
      director: "Elena Ruiz",
      producerId: "producer-1",
      deadline: "2026-08-28",
      createdDate: "2026-07-02",
      status: "In progress",
      originalSynopsis:
        "A submarine crew must decide whether to launch a retaliatory strike as communications with command break down during a tense standoff at sea. As tensions rise below deck, the captain and his first officer clash over duty, doubt, and the cost of following orders blindly.",
      translations: [
        translation({
          language: "Spanish (LatAm)",
          status: "Review",
          assignedTranslatorId: "translator-1",
          assignedDate: "2026-08-10",
          daysSpent: 6,
          method: "Hybrid",
          reviewerId: REVIEWER,
          translatedText:
            "Una tripulación de submarino debe decidir si lanza un ataque de represalia mientras las comunicaciones con el mando se interrumpen durante un tenso enfrentamiento en el mar.",
          comments: [
            comment(
              "Sara Lindqvist",
              "Reviewer",
              "The line about the submarine crew's decision reads a bit stiff in Spanish — consider a more natural phrasing for “break down.”",
              "2026-08-22T10:00:00Z",
            ),
            comment(
              "Sara Lindqvist",
              "Reviewer",
              "Second pass looks much better. One more check on the captain/first officer dialogue tone and this is ready to approve.",
              "2026-08-24T09:30:00Z",
            ),
          ],
        }),
        translation({
          language: "French",
          status: "In progress",
          assignedTranslatorId: "translator-2",
          assignedDate: "2026-08-12",
          daysSpent: 4,
          method: "Manual",
          translatedText:
            "Un équipage de sous-marin doit décider de lancer une frappe de représailles alors que les communications avec le commandement s'interrompent en pleine mer.",
        }),
        translation({ language: "German", status: "To do" }),
        translation({
          language: "Portuguese",
          status: "Done",
          assignedTranslatorId: "translator-4",
          assignedDate: "2026-08-05",
          daysSpent: 11,
          method: "AI",
          reviewerId: REVIEWER,
          reviewOutcome: "Approved",
          translatedText:
            "Uma tripulação de submarino precisa decidir se lança um ataque de retaliação enquanto as comunicações com o comando falham durante um tenso confronto no mar.",
        }),
        translation({
          language: "Italian",
          status: "Review",
          assignedTranslatorId: "translator-5",
          assignedDate: "2026-08-14",
          daysSpent: 3,
          method: "AI",
          reviewerId: REVIEWER,
          translatedText:
            "Un equipaggio di sottomarino deve decidere se lanciare un attacco di rappresaglia mentre le comunicazioni con il comando si interrompono durante un teso confronto in mare.",
        }),
        translation({
          language: "Korean",
          status: "In progress",
          assignedTranslatorId: "translator-6",
          assignedDate: "2026-08-07",
          daysSpent: 10,
          method: "Manual",
          translatedText: "잠수함 승무원은 지휘부와의 통신이 두절되는 긴박한 대치 상황 속에서 보복 공격을 감행할지 결정해야 한다.",
        }),
        translation({ language: "Mandarin Chinese", status: "To do" }),
        translation({ language: "Arabic", status: "To do" }),
      ],
    },
    {
      id: "movie-2",
      title: "Northern Lights",
      director: "Kenji Watanabe",
      producerId: "producer-1",
      deadline: "2026-09-04",
      createdDate: "2026-07-10",
      status: "Blocked",
      originalSynopsis:
        "Stranded at a remote Arctic research station after a supply plane crash, a team of scientists must survive the polar night while a slow-burning conflict over rationed resources threatens to tear the group apart.",
      translations: [
        translation({
          language: "French",
          status: "Blocked",
          assignedTranslatorId: "translator-2",
          assignedDate: "2026-08-20",
          daysSpent: 2,
          blockedReason: "Incomplete synopsis",
        }),
        translation({
          language: "Japanese",
          status: "In progress",
          assignedTranslatorId: "translator-1",
          assignedDate: "2026-08-21",
          daysSpent: 3,
          method: "Manual",
          reviewerId: REVIEWER,
          translatedText: "北極の物資輸送機が墜落した後、遠隔地の研究基地に取り残された科学者チームは極夜を生き延びなければならない。",
          comments: [
            comment(
              "Sara Lindqvist",
              "Reviewer",
              "Early draft reads well — flag once you're ready for a first review pass on the rationing subplot.",
              "2026-08-23T14:00:00Z",
            ),
          ],
        }),
        translation({ language: "German", status: "To do" }),
        translation({ language: "Korean", status: "To do" }),
      ],
    },
    {
      id: "movie-3",
      title: "The Last Harvest",
      director: "Amara Okafor",
      producerId: "producer-1",
      deadline: "2026-09-12",
      createdDate: "2026-08-01",
      status: "To do",
      originalSynopsis:
        "As drought grips a small farming town, a young agronomist returns home to save her family's land, only to uncover a decades-old water rights dispute that could determine the town's survival.",
      translations: [
        translation({ language: "Spanish (LatAm)", status: "To do" }),
        translation({ language: "French", status: "To do" }),
        translation({ language: "German", status: "To do" }),
        translation({ language: "Portuguese", status: "To do" }),
      ],
    },
    {
      id: "movie-4",
      title: "Glass Horizon",
      director: "Lucas Bernard",
      producerId: "producer-1",
      deadline: "2026-08-20",
      createdDate: "2026-06-15",
      status: "Done",
      originalSynopsis:
        "A structural engineer investigating a glass skyscraper's mysterious cracks uncovers a corporate cover-up that puts thousands of lives — including her own family's — at risk.",
      translations: [
        translation({
          language: "Portuguese",
          status: "Done",
          assignedTranslatorId: "translator-4",
          assignedDate: "2026-07-20",
          daysSpent: 5,
          method: "AI",
          reviewerId: REVIEWER,
          reviewOutcome: "Approved",
          translatedText:
            "Uma engenheira estrutural que investiga rachaduras misteriosas em um arranha-céu de vidro descobre um encobrimento corporativo que coloca milhares de vidas em risco.",
          comments: [
            comment("Sara Lindqvist", "Reviewer", "Clean translation, approved as-is.", "2026-08-01T11:00:00Z"),
          ],
        }),
        translation({
          language: "Spanish (LatAm)",
          status: "Done",
          assignedTranslatorId: "translator-1",
          assignedDate: "2026-07-18",
          daysSpent: 6,
          method: "Hybrid",
          reviewerId: REVIEWER,
          reviewOutcome: "Approved",
          translatedText:
            "Una ingeniera estructural que investiga las misteriosas grietas de un rascacielos de cristal descubre un encubrimiento corporativo que pone en riesgo miles de vidas.",
        }),
        translation({
          language: "French",
          status: "Done",
          assignedTranslatorId: "translator-2",
          assignedDate: "2026-07-19",
          daysSpent: 7,
          method: "Manual",
          reviewerId: REVIEWER,
          reviewOutcome: "Approved",
          translatedText:
            "Une ingénieure en structures enquêtant sur les fissures mystérieuses d'un gratte-ciel de verre découvre une dissimulation qui met en danger des milliers de vies.",
        }),
      ],
    },
    {
      id: "movie-5",
      title: "Second Sun",
      director: "Priya Nair",
      producerId: "producer-1",
      deadline: "2026-09-30",
      createdDate: "2026-08-05",
      status: "In progress",
      originalSynopsis:
        "When a second sun appears in the sky without explanation, a meteorologist and a skeptical journalist race to uncover the truth before global panic spirals out of control.",
      translations: [
        translation({
          language: "Japanese",
          status: "In progress",
          assignedTranslatorId: "translator-1",
          assignedDate: "2026-08-25",
          daysSpent: 2,
          method: "AI",
          reviewerId: REVIEWER,
          translatedText: "空に説明のつかない二つ目の太陽が現れたとき、気象学者と懐疑的なジャーナリストは世界的なパニックが制御不能になる前に真実を突き止めようと奔走する。",
        }),
        translation({
          language: "French",
          status: "In progress",
          assignedTranslatorId: "translator-2",
          assignedDate: "2026-08-26",
          daysSpent: 1,
          method: "Manual",
          translatedText:
            "Lorsqu'un second soleil apparaît dans le ciel sans explication, une météorologue et un journaliste sceptique se lancent dans une course contre la montre.",
        }),
        translation({ language: "German", status: "To do" }),
        translation({ language: "Korean", status: "To do" }),
        translation({ language: "Portuguese", status: "To do" }),
      ],
    },
  ];
}
