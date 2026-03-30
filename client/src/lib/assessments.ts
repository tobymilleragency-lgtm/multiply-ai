export type AssessmentType = "inner-field" | "send" | "field";

export type Question =
  | { id: string; text: string; type: "scale"; labels: string[] }
  | { id: string; text: string; type: "choice"; options: string[] }
  | {
      id: string;
      text: string;
      type: "open";
      placeholder?: string;
      multiline?: boolean;
    };

export type Section = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};
export type AssessmentDef = {
  slug: AssessmentType;
  title: string;
  shortTitle: string;
  intro: string;
  description: string;
  resultTabs: string[];
  sections: Section[];
};

const scale5 = ["Never", "Rarely", "Sometimes", "Often", "Always"];
const scale4 = ["Not yet", "Emerging", "Present", "Consistent"];

export const assessments: AssessmentDef[] = [
  {
    slug: "inner-field",
    title: "Inner Field Diagnostic",
    shortTitle: "Inner Field",
    intro:
      "This diagnostic stays with the soul of the pastor. It names fatigue, hidden erosion, false strength, fear, and the places where private strain is shaping public leadership.",
    description:
      "Read the inner condition of the pastor before outward pressure distorts the whole field.",
    resultTabs: [
      "Soul reading",
      "Root causes",
      "Pressure points",
      "Needed honesty",
      "Next steps",
    ],
    sections: [
      {
        id: "origin",
        title: "What formed you",
        description:
          "Family patterns, approval hunger, and old shame that still colors present leadership.",
        questions: [
          {
            id: "if_origin_1",
            text: "When I make a serious mistake in ministry, shame reaches past what I did and starts speaking against who I am.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_origin_2",
            text: "When I sense disapproval, I work harder to quiet the fear underneath it.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_origin_3",
            text: "There is a steady feeling under the surface that I am still not enough.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_origin_4",
            text: "What drives you most days in ministry right now?",
            type: "choice",
            options: [
              "Calling with peace",
              "Fear of failure",
              "A mix of both",
              "I am no longer sure",
            ],
          },
          {
            id: "if_origin_5",
            text: "What do you fear people would see if the strong exterior slipped?",
            type: "open",
            multiline: true,
            placeholder: "Say it plainly.",
          },
        ],
      },
      {
        id: "identity",
        title: "Who you are without the role",
        description:
          "Identity, steadiness, and what remains when the ministry title is stripped away.",
        questions: [
          {
            id: "if_identity_1",
            text: "I can describe who I am apart from ministry, and that answer feels full and true.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_identity_2",
            text: "When ministry is strained, I stay inwardly steady before God.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_identity_3",
            text: "Which statement sounds most like your inner life right now?",
            type: "choice",
            options: [
              "I know who I am before God",
              "I can function, but I feel thin inside",
              "I am performing what people need",
              "I have lost sight of myself under the role",
            ],
          },
          {
            id: "if_identity_4",
            text: "Describe yourself as a man and a disciple. Do not describe your job.",
            type: "open",
            multiline: true,
            placeholder: "Write the answer without the title.",
          },
        ],
      },
      {
        id: "wound",
        title: "Where pain still speaks",
        description:
          "Triggers, defensive patterns, and old wounds that keep showing up in present leadership.",
        questions: [
          {
            id: "if_wound_1",
            text: "Some ministry situations stir a reaction in me that is stronger than the moment itself.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_wound_2",
            text: "When you feel threatened in ministry, what usually happens inside you first?",
            type: "choice",
            options: [
              "I get defensive",
              "I pull back",
              "I clamp down and control",
              "I please people",
              "I go numb",
            ],
          },
          {
            id: "if_wound_3",
            text: "What are you still pretending is fine when it is not fine?",
            type: "open",
            multiline: true,
            placeholder: "Tell the truth without dressing it up.",
          },
        ],
      },
      {
        id: "motivation",
        title: "What is driving you now",
        description:
          "Love, fear, exhaustion, and the hidden engine under current leadership effort.",
        questions: [
          {
            id: "if_mot_1",
            text: "When I think about ministry, love and joy still feel stronger than dread and fatigue.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_mot_2",
            text: "When a ministry week goes badly, what becomes strongest inside you?",
            type: "choice",
            options: [
              "Discouragement that passes",
              "A hit to my worth",
              "Anxious overwork",
              "Numbness",
              "Anger",
              "A return to prayer",
            ],
          },
          {
            id: "if_mot_3",
            text: "What would you stop carrying tomorrow if you were no longer afraid of letting people down?",
            type: "open",
            multiline: true,
            placeholder: "Write the first honest answer.",
          },
        ],
      },
      {
        id: "freedom",
        title: "Where freedom is thin",
        description:
          "Prayer, rest, and freedom from image management and performance pressure.",
        questions: [
          {
            id: "if_free_1",
            text: "I lead from love for people more than from a need to prove myself to them.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "if_free_2",
            text: "How would you describe your private prayer life right now?",
            type: "choice",
            options: [
              "Alive and steady",
              "Present but thin",
              "Mostly tied to ministry need",
              "Habit without life",
              "Dry and distant",
            ],
          },
          {
            id: "if_free_3",
            text: "If freedom grew in your life, what would change first?",
            type: "open",
            multiline: true,
            placeholder: "Do not describe success. Describe freedom.",
          },
        ],
      },
    ],
  },
  {
    slug: "send",
    title: "SEND Diagnostic",
    shortTitle: "SEND",
    intro:
      "This diagnostic reads leadership readiness. It names strain, clarity, team health, disciple-making posture, and the places where the load is outpacing the structure.",
    description:
      "Read leadership readiness, team strain, and disciple-making clarity before more weight lands on a weak structure.",
    resultTabs: [
      "Leadership reading",
      "Readiness",
      "Pressure points",
      "90-day focus",
      "Counsel notes",
      "Support tools",
    ],
    sections: [
      {
        id: "esi",
        title: "Self-awareness and spiritual steadiness",
        description:
          "Emotional awareness, spiritual nourishment, and whether the pastor is staying awake to his own inner state.",
        questions: [
          {
            id: "send_esi_1",
            text: "I can name what I am feeling before pressure or conflict starts driving me.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_esi_2",
            text: "My private spiritual life still nourishes me. It is not only functional for ministry.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_esi_3",
            text: "I have trusted people who can speak truth to me, and I listen when they do.",
            type: "scale",
            labels: scale5,
          },
        ],
      },
      {
        id: "values",
        title: "Identity and values in leadership",
        description:
          "Identity, values, mission clarity, and whether the pastor is leading from conviction or reaction.",
        questions: [
          {
            id: "send_values_1",
            text: "I lead from a clear identity before God more than from performance pressure or approval hunger.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_values_2",
            text: "Which statement best fits your leadership posture right now?",
            type: "choice",
            options: [
              "I am still finding my footing",
              "I have some clarity but feel uneven",
              "I know who I am but do not always lead from it",
              "I lead from a settled center",
            ],
          },
          {
            id: "send_values_3",
            text: "What ministry context are you carrying right now?",
            type: "open",
            multiline: true,
            placeholder: "Give the real context.",
          },
        ],
      },
      {
        id: "competencies",
        title: "Leadership strength under pressure",
        description:
          "Vision, planning, and team development under real ministry conditions.",
        questions: [
          {
            id: "send_comp_1",
            text: "I can speak a clear future that helps people know what matters now.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_comp_2",
            text: "I can turn direction into concrete plans, decisions, and follow-through.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_comp_3",
            text: "I am steadily developing people instead of carrying too much myself.",
            type: "scale",
            labels: scale5,
          },
        ],
      },
      {
        id: "discipleship",
        title: "Disciple-making and multiplication readiness",
        description:
          "Disciple-making clarity, multiplication strength, and where the pathway is breaking down.",
        questions: [
          {
            id: "send_disc_1",
            text: "I can describe a clear path from new believer to reproducing leader.",
            type: "scale",
            labels: scale5,
          },
          {
            id: "send_disc_2",
            text: "Where is your church feeling the most strain in multiplication right now?",
            type: "choice",
            options: [
              "Too few people are engaged",
              "People attend but stall",
              "Disciples are not becoming leaders",
              "Leaders are not reproducing",
            ],
          },
          {
            id: "send_disc_3",
            text: "What is the hardest leadership challenge in front of you over the next year?",
            type: "open",
            multiline: true,
            placeholder: "Name the real challenge.",
          },
        ],
      },
    ],
  },
  {
    slug: "field",
    title: "Field Diagnostic",
    shortTitle: "Field",
    intro:
      "This diagnostic reads the actual ministry field. It traces the path from the lost to mature leaders and shows where disciple-making has stalled, thinned out, or broken down.",
    description:
      "Read the church field, the disciple-making path, and the points where friction is stalling movement.",
    resultTabs: [
      "Field reading",
      "Current pattern",
      "One next step",
      "Pipeline map",
      "Movement path",
      "12-month focus",
    ],
    sections: [
      {
        id: "reach",
        title: "Reaching people far from Christ",
        description:
          "Mission posture, outward relationships, and whether the church still lives near the field.",
        questions: [
          {
            id: "field_reach_1",
            text: "Our people have real ongoing relationships with people outside the church who do not know Jesus.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_reach_2",
            text: "Our people see daily life as part of their mission field.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_reach_3",
            text: "What is the truest thing you can say about how your church is reaching people in everyday life?",
            type: "open",
            multiline: true,
            placeholder: "Describe the real field, not the ideal field.",
          },
        ],
      },
      {
        id: "seek",
        title: "Walking with seekers",
        description:
          "Spiritual curiosity, relational follow-through, and whether open doors are actually being shepherded.",
        questions: [
          {
            id: "field_seek_1",
            text: "We have a simple and usable way for people to begin spiritual conversations naturally.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_seek_2",
            text: "When someone becomes open to spiritual things, there is a clear relational path from that moment to care and follow-up.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_seek_3",
            text: "When someone in your context grows spiritually curious, what usually happens next?",
            type: "open",
            multiline: true,
            placeholder: "Describe the real pattern.",
          },
        ],
      },
      {
        id: "disc",
        title: "Forming growing disciples",
        description:
          "Discipleship patterns, obedience, and whether ordinary people can actually carry the path forward.",
        questions: [
          {
            id: "field_disc_1",
            text: "People are moving from passive attendance into obedience, mission, and visible growth.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_disc_2",
            text: "Our discipleship pattern is simple enough that an ordinary non-staff person could lead it.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_disc_3",
            text: "If you sat in a typical discipleship setting in your church, what would concern you most?",
            type: "open",
            multiline: true,
            placeholder: "Tell the truth about what you would see.",
          },
        ],
      },
      {
        id: "mob",
        title: "Developing mobilizers",
        description:
          "Leader formation beyond the pastor and whether the church is building people or only filling roles.",
        questions: [
          {
            id: "field_mob_1",
            text: "We are developing people to lead others, not only asking them to fill slots.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_mob_2",
            text: "We can name specific people right now who are being developed toward multiplying leadership.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_mob_3",
            text: "Who are you developing right now who could one day carry real leadership weight with you?",
            type: "open",
            multiline: true,
            placeholder: "If no one comes to mind, say why.",
          },
        ],
      },
      {
        id: "mult",
        title: "Multiplying communities",
        description:
          "Reproduction, future trajectory, and whether anything in the church is truly multiplying.",
        questions: [
          {
            id: "field_mult_1",
            text: "Something meaningful has multiplied in the last two years.",
            type: "scale",
            labels: scale4,
          },
          {
            id: "field_mult_2",
            text: "What, if anything, is reproducing right now?",
            type: "open",
            multiline: true,
            placeholder: "Be specific.",
          },
          {
            id: "field_mult_3",
            text: "If the church stays on this path for five more years, what kind of field will it become?",
            type: "open",
            multiline: true,
            placeholder: "Give the honest reading.",
          },
        ],
      },
    ],
  },
];

export function getAssessment(slug: string) {
  return assessments.find(item => item.slug === slug);
}
