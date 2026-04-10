import { GraduationCap, Mail, MapPin, Phone } from 'lucide-react';

import PageLayout from '../components/PageLayout';

type School = {
  name: string;
  abbr: string;
  tone: 'violet' | 'blue' | 'rose' | 'cyan' | 'amber' | 'emerald' | 'stone';
  cabinet: string;
  programs: string | null;
};

type Department = {
  name: string;
  short: string | null;
  cabinet: string;
  phone: string | null;
  email: string | null;
  description: string;
  extraEmail?: string;
  extraEmailLabel?: string;
};

const SCHOOLS: School[] = [
  {
    name: 'Школа Искусственного Интеллекта и науки о данных',
    abbr: 'AI & DS',
    tone: 'violet',
    cabinet: 'C1.1.322',
    programs: 'BDA, IT, MCS',
  },
  {
    name: 'Школа Программной Инженерии',
    abbr: 'SE',
    tone: 'blue',
    cabinet: 'C1.3.359',
    programs: 'SE',
  },
  {
    name: 'Школа Кибербезопасности',
    abbr: 'CYBER',
    tone: 'rose',
    cabinet: 'C1.1.330',
    programs: 'SST, CS',
  },
  {
    name: 'Школа Интеллектуальных Систем',
    abbr: 'IS',
    tone: 'cyan',
    cabinet: 'C1.1.321',
    programs: 'ST, IIOT, EE',
  },
  {
    name: 'Школа Креативных Индустрий',
    abbr: 'CREA',
    tone: 'amber',
    cabinet: 'C1.3.353',
    programs: 'ITM, ITE, DJ, AIB, MT',
  },
  {
    name: 'Школа Цифрового Государственного Управления',
    abbr: 'DPA',
    tone: 'emerald',
    cabinet: 'C1.1.335',
    programs: 'DPA',
  },
  {
    name: 'Школа Общеобразовательных дисциплин',
    abbr: 'GED',
    tone: 'stone',
    cabinet: 'C1.1.263',
    programs: null,
  },
];

const DEPARTMENTS: Department[] = [
  {
    name: 'Департамент по социально-воспитательной работе',
    short: 'ДСВР',
    cabinet: 'C1.1.323',
    phone: '8 (7172) 64-57-09',
    email: 'Arman.Kenzhebekov@astanait.edu.kz',
    description:
      'Решают вопросы студенческих клубов и организаций, общежития, локеров. Распределяют социальную GPA.',
  },
  {
    name: 'Департамент науки и инноваций',
    short: 'ДНИ',
    cabinet: 'C1.2.155',
    phone: '8 (7172) 64-57-13',
    email: 'nurkhat.zhakiyev@astanait.edu.kz',
    description:
      'Осуществляют планирование, координацию и организацию научной и инновационной деятельности. Распределяют research GPA.',
  },
  {
    name: 'Цифровой институт непрерывного образования',
    short: 'ЦИНО',
    cabinet: 'C1.2.327',
    phone: '8 (7172) 64-34-48',
    email: 'edtech@astanait.edu.kz',
    description:
      'Занимаются продвижением lifelong learning. Можно обращаться по вопросам платформы learn.astanait.edu.kz.',
  },
  {
    name: 'Департамент информационных технологий',
    short: 'ДИТ',
    cabinet: 'C1.2.255',
    phone: null,
    email: 'helpdesk@astanait.edu.kz',
    description:
      'Решают проблемы по поводу ID-карт, смены пароля и работы Moodle.',
  },
  {
    name: 'Академический департамент',
    short: null,
    cabinet: 'C1.1.265',
    phone: '8 (7172) 64-57-07',
    email: 'gulzhan.soltan@astanait.edu.kz',
    description:
      'Занимаются планированием, организацией и контролем учебного процесса. Через них можно забронировать кабинет.',
  },
  {
    name: 'Офис регистратора университета',
    short: null,
    cabinet: 'C1.1.271',
    phone: '8 (7172) 64-57-07',
    email: 'Aliya.Koitanova@astanait.edu.kz',
    extraEmail: 'transcript@astanait.edu.kz',
    extraEmailLabel: 'Запрос на транскрипт',
    description:
      'Можно обратиться по вопросам перевода, Moodle, ретейков или FX. Там же выдают транскрипт после предварительного запроса на почту.',
  },
  {
    name: 'Центр карьеры и трудоустройства',
    short: 'ЦКиТ',
    cabinet: 'C1.1.272',
    phone: '8 (7172) 64-57-07',
    email: 'madina.mukaliyeva@astanait.edu.kz',
    description:
      'Занимаются практикой и трудоустройством студентов.',
  },
  {
    name: 'Студенческий отдел',
    short: null,
    cabinet: 'C1.1.273',
    phone: '8 (7172) 64-57-07',
    email: null,
    description:
      'Собирают и ведут личные дела обучающихся. Основные документы студентов находятся там.',
  },
  {
    name: 'Департамент маркетинга и связи с общественностью',
    short: 'ДМиСО',
    cabinet: 'C1.2.336',
    phone: '8 (7172) 64-57-18',
    email: 'temirlan.zhanay@astanait.edu.kz',
    description:
      'Занимаются маркетингом, СМИ университета и приемом абитуриентов. Сюда можно обращаться по вопросам стажировки и поступления.',
  },
  {
    name: 'Департамент бухгалтерского учета',
    short: null,
    cabinet: 'C1.3.355',
    phone: '8 (7172) 64-57-20',
    email: null,
    description: 'Обращаться по финансовым вопросам.',
  },
];

export default function HelpPage() {
  return (
    <PageLayout
      title="Администрация AITU"
      description="Краткий справочник по школам, департаментам и важным контактам Astana IT University."
    >
      <section className="card section-block">
        <div className="section-head">
          <div>
            <h2>Все самое важное, что может понадобиться</h2>
          </div>
          <div className="row-actions">
            <a className="btn btn-primary" href="https://astanait.edu.kz" target="_blank" rel="noopener noreferrer">
              Сайт AITU
            </a>
            <a className="btn btn-muted" href="mailto:info@astanait.edu.kz">
              Общая почта
            </a>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat">
            <span>Школы</span>
            <strong>{SCHOOLS.length}</strong>
          </div>
          <div className="stat">
            <span>Подразделения</span>
            <strong>{DEPARTMENTS.length}</strong>
          </div>
          <div className="stat">
            <span>Главный блок</span>
            <strong>C1</strong>
          </div>
          <div className="stat">
            <span>Транскрипт</span>
            <strong>transcript@</strong>
          </div>
        </div>
      </section>

      <div className="help-content">
        <h2 className="help-section-title">Школы определенных дисциплин и ОП</h2>
        <div className="schools-grid">
          {SCHOOLS.map((school) => (
            <article key={school.name} className="card school-card">
              <div className="school-card__header">
                <span className="school-card__badge" data-tone={school.tone}>
                  {school.abbr}
                </span>
                <h2 className="school-card__name">{school.name}</h2>
              </div>
              <div className="school-card__contact">
                <span className="school-card__detail">
                  <MapPin size={14} />
                  {school.cabinet}
                </span>
                {school.programs ? (
                  <span className="school-card__detail">
                    <GraduationCap size={14} />
                    {school.programs}
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>

        <h2 className="help-section-title help-section-title--offset">Департаменты и офисы</h2>
        <div className="dept-list">
          {DEPARTMENTS.map((dept) => (
            <article key={dept.name} className="card dept-row">
              <div className="dept-row__main">
                <div className="dept-row__label">
                  <span className="dept-row__name">{dept.name}</span>
                  {dept.short ? <span className="dept-row__badge">{dept.short}</span> : null}
                </div>
                <p className="dept-row__desc">{dept.description}</p>
              </div>

              <div className="dept-row__info">
                <span className="dept-row__detail">
                  <MapPin size={14} />
                  {dept.cabinet}
                </span>
                {dept.phone ? (
                  <span className="dept-row__detail">
                    <Phone size={14} />
                    {dept.phone}
                  </span>
                ) : null}
                {dept.email ? (
                  <a className="dept-row__detail dept-row__email" href={`mailto:${dept.email}`}>
                    <Mail size={14} />
                    {dept.email}
                  </a>
                ) : null}
                {dept.extraEmail ? (
                  <a className="dept-row__detail dept-row__email" href={`mailto:${dept.extraEmail}`}>
                    <Mail size={14} />
                    {dept.extraEmailLabel}: {dept.extraEmail}
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
