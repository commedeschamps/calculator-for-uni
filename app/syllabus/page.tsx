'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import { useToast } from '../components/ToastProvider';
import { usePersistedState } from '../lib/usePersistedState';
import {
  ATTESTATION_SECTION_MAX,
  buildSyllabusLinkedGpaCourses,
  calculateSyllabusCourseResult,
  createSyllabusCourse,
  createSyllabusItem,
  createSyllabusSection,
  DEFAULT_SYLLABUS_SECTION_PRESETS,
  detectSyllabusSectionKind,
  extractCourseTitleAndCredits,
  formatScore,
  getAcademicOutcomeFromTotal,
  getSyllabusItemInputConfig,
  getSyllabusSectionMetricLabel,
  normalizeCourseName,
  parseInputValue,
  SYLLABUS_GPA_LINK_STORAGE_KEY,
  type AttestationFormulaBreakdown,
  type StatusTone,
  type SyllabusCourse,
  type SyllabusLinkedGpaCourse,
  type SyllabusSection,
  type SyllabusSectionKind,
  type SyllabusSectionResult,
} from '../lib/academic';
import {
  type SyllabusTemplate,
  SYLLABUS_TEMPLATES,
  getBaseTemplates,
  getElectivePairs,
} from '../lib/syllabusTemplates';

type CourseViewModel = {
  course: SyllabusCourse;
  totalWeight: number;
  weightedTotal: number;
  hasWeightMismatch: boolean;
  hasInvalidWeights: boolean;
  hasAttestationOverflow: boolean;
  usesAttestationStructure: boolean;
  formulaBreakdown: AttestationFormulaBreakdown | null;
  letter: ReturnType<typeof getAcademicOutcomeFromTotal>['letterInfo'];
  statusText: string;
  statusTone: StatusTone;
  sectionMetrics: Map<string, SyllabusSectionResult>;
  gradedItems: number;
  totalItems: number;
  completion: number;
};

const SECTION_KIND_OPTIONS: Array<{ value: SyllabusSectionKind; label: string }> = [
  { value: 'attestation', label: 'Attestation' },
  { value: 'final', label: 'Final' },
  { value: 'regular', label: 'Regular' },
];

function detectItemPrefix(section: Pick<SyllabusSection, 'kind' | 'title'>): string {
  const normalized = section.title.trim().toLowerCase();
  if (section.kind === 'final') return 'Final';
  if (normalized.includes('quiz')) return 'Quiz';
  if (normalized.includes('midterm')) return 'Midterm';
  if (normalized.includes('endterm')) return 'Endterm';
  if (normalized.includes('report')) return 'Report';
  if (section.kind === 'regular') return 'Item';
  return 'Assignment';
}

function nextItemLabel(section: Pick<SyllabusSection, 'kind' | 'title'>, itemCount: number): string {
  return `${detectItemPrefix(section)} ${itemCount + 1}`;
}

function ensureSectionId(section: Pick<SyllabusSection, 'title' | 'weight' | 'kind'> & { id?: string }): string {
  if (typeof section.id === 'string' && section.id !== '') {
    return section.id;
  }

  return createSyllabusSection(section.title, section.weight, [], section.kind).id;
}

function normalizeTemplateItemTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function collectTemplateItemTitles(template: SyllabusTemplate): string[] {
  return template.sections.flatMap((section) => section.items.map((item) => normalizeTemplateItemTitle(item.title)));
}

function collectCourseItemTitles(course: Pick<SyllabusCourse, 'sections'>): string[] {
  return course.sections.flatMap((section) => section.items.map((item) => normalizeTemplateItemTitle(item.title)));
}

function isGenericTemplateItemTitle(title: string): boolean {
  return /^(assignment \d+|classwork \d+|quiz \d+|midterm(?: essay)?|endterm(?: essay)?|final (?:exam|essay|project)|mcq)$/i.test(
    title,
  );
}

function shouldRefreshTemplateSections(course: SyllabusCourse, template: SyllabusTemplate): boolean {
  if (course.sections.some((section) => section.items.some((item) => item.score.trim() !== ''))) {
    return false;
  }

  const currentTitles = collectCourseItemTitles(course);
  const templateTitles = collectTemplateItemTitles(template);

  if (
    currentTitles.length === templateTitles.length &&
    currentTitles.every((title, index) => title === templateTitles[index])
  ) {
    return false;
  }

  return currentTitles.length > 0 && currentTitles.every((title) => isGenericTemplateItemTitle(title));
}

function normalizeStoredSyllabusCourses(
  courses: SyllabusCourse[],
  templatesByName: Map<string, SyllabusTemplate>,
): SyllabusCourse[] {
  let changed = false;

  const normalized = courses.map((course) => {
    const parsedTitle = extractCourseTitleAndCredits(course.title ?? `Course ${course.id}`);
    const title = parsedTitle.title || `Course ${course.id}`;

    const rawCredits = (course as SyllabusCourse & { credits?: unknown }).credits;
    let credits = '';
    if (typeof rawCredits === 'string') {
      credits = rawCredits;
    } else if (typeof rawCredits === 'number' && Number.isFinite(rawCredits)) {
      credits = String(rawCredits);
    }

    if (!credits && parsedTitle.credits) {
      credits = parsedTitle.credits;
    }

    if (!credits) {
      const template = templatesByName.get(normalizeCourseName(title));
      if (template) {
        credits = String(template.credits);
      }
    }

    if (title !== course.title || credits !== (typeof rawCredits === 'string' ? rawCredits : '')) {
      changed = true;
    }

    let sections = course.sections.map((section) => {
      let sectionTitle = section.title;
      if (/\blab(s)?\b/i.test(sectionTitle)) {
        sectionTitle = 'Assignments';
        changed = true;
      }

      const rawKind = (section as SyllabusSection & { kind?: unknown }).kind;
      const kind =
        rawKind === 'attestation' || rawKind === 'final' || rawKind === 'regular'
          ? rawKind
          : detectSyllabusSectionKind(sectionTitle);

      if (rawKind !== kind || sectionTitle !== section.title) {
        changed = true;
      }

      const items = section.items.map((item) => {
        const updatedTitle = item.title.replace(/^lab\s*(\d+)$/i, 'Assignment $1');
        const fallbackMaxPoints = kind === 'attestation' ? '25' : '100';
        const maxPoints = item.maxPoints === '' || item.maxPoints == null ? fallbackMaxPoints : item.maxPoints;

        if (updatedTitle !== item.title || maxPoints !== item.maxPoints) {
          changed = true;
        }

        return {
          ...item,
          title: updatedTitle,
          maxPoints,
        };
      });

      return {
        ...section,
        id: ensureSectionId({ ...section, title: sectionTitle, kind }),
        kind,
        title: sectionTitle,
        items,
      };
    });

    if (sections.length === 0) {
      sections = createSyllabusCourse(course.id, title, credits).sections;
      changed = true;
    }

    const template = templatesByName.get(normalizeCourseName(title));
    if (template) {
      const nextCourse: SyllabusCourse = {
        ...course,
        title,
        credits,
        sections,
      };

      if (shouldRefreshTemplateSections(nextCourse, template)) {
        sections = template.sections.map((section) =>
          createSyllabusSection(
            section.title,
            section.weight,
            section.items,
            section.kind ?? detectSyllabusSectionKind(section.title),
          ),
        );
        changed = true;
      }
    }

    return {
      ...course,
      title,
      credits,
      sections,
    };
  });

  return changed ? normalized : courses;
}

export default function SyllabusPage() {
  const [courses, setCourses, hasHydratedCourses] = usePersistedState<SyllabusCourse[]>('syl-courses', []);
  const [nextCourseId, setNextCourseId] = usePersistedState('syl-nextId', 1);
  const [selectedKeys, setSelectedKeys] = usePersistedState<string[]>('syl-selected-templates', []);
  const [, setLinkedGpaCourses] = usePersistedState<SyllabusLinkedGpaCourse[]>(SYLLABUS_GPA_LINK_STORAGE_KEY, []);
  const [pickerOpen, setPickerOpen] = useState(false);

  const { showToast } = useToast();

  const selectedTemplates = useMemo(() => new Set(selectedKeys), [selectedKeys]);
  const BASE_TEMPLATES = useMemo(() => getBaseTemplates(), []);
  const ELECTIVE_PAIRS = useMemo(() => getElectivePairs(), []);
  const templatesByName = useMemo(
    () => new Map(SYLLABUS_TEMPLATES.map((template) => [normalizeCourseName(template.name), template])),
    [],
  );

  const toggleTemplate = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return Array.from(next);
    });
  }, [setSelectedKeys]);

  useEffect(() => {
    setCourses((prev) => normalizeStoredSyllabusCourses(prev, templatesByName));
  }, [setCourses, templatesByName]);

  useEffect(() => {
    if (hasHydratedCourses && courses.length === 0) {
      setPickerOpen(true);
    }
  }, [courses.length, hasHydratedCourses]);

  const totalCredits = useMemo(() => {
    let sum = 0;
    for (const template of SYLLABUS_TEMPLATES) {
      if (selectedTemplates.has(template.key)) {
        sum += template.credits;
      }
    }
    return sum;
  }, [selectedTemplates]);

  function templateToCourse(template: SyllabusTemplate, id: number): SyllabusCourse {
    return {
      id,
      title: template.name,
      credits: String(template.credits),
      sections: template.sections.map((section) =>
        createSyllabusSection(
          section.title,
          section.weight,
          section.items,
          section.kind ?? detectSyllabusSectionKind(section.title),
        ),
      ),
    };
  }

  function handleLoadTemplates() {
    const templates = SYLLABUS_TEMPLATES.filter((template) => selectedTemplates.has(template.key));
    if (templates.length === 0) return;

    const existingNames = new Set(courses.map((course) => normalizeCourseName(course.title)));
    const toAdd = templates.filter((template) => !existingNames.has(normalizeCourseName(template.name)));

    if (toAdd.length === 0) {
      showToast('All selected templates are already loaded');
      return;
    }

    let id = nextCourseId;
    const newCourses = toAdd.map((template) => templateToCourse(template, id++));
    setCourses((prev) => [...prev, ...newCourses]);
    setNextCourseId(id);
    setPickerOpen(false);
    showToast(`Added ${newCourses.length} course template${newCourses.length > 1 ? 's' : ''}`);
  }

  const courseView = useMemo<CourseViewModel[]>(
    () =>
      courses.map((course) => {
        const result = calculateSyllabusCourseResult(course);
        const hasWeightMismatch = Math.abs(result.totalWeight - 100) > 0.0001;
        const outcome = getAcademicOutcomeFromTotal(result.weightedTotal, { hasWeightMismatch });
        const gradedItems = result.sectionResults.reduce((sum, section) => sum + section.gradedItems, 0);
        const totalItems = result.sectionResults.reduce((sum, section) => sum + section.totalItems, 0);
        const completion = totalItems > 0 ? Math.round((gradedItems / totalItems) * 100) : 0;

        return {
          course,
          totalWeight: result.totalWeight,
          weightedTotal: result.weightedTotal,
          hasWeightMismatch,
          hasInvalidWeights: result.hasInvalidWeights,
          hasAttestationOverflow: result.hasAttestationOverflow,
          usesAttestationStructure: result.usesAttestationStructure,
          formulaBreakdown: result.formulaBreakdown,
          letter: outcome.letterInfo,
          statusText: outcome.statusText,
          statusTone: outcome.statusTone,
          sectionMetrics: new Map(result.sectionResults.map((row) => [row.sectionId, row])),
          gradedItems,
          totalItems,
          completion,
        };
      }),
    [courses],
  );

  const linkedGpaCourses = useMemo(() => buildSyllabusLinkedGpaCourses(courses), [courses]);
  const linkedCourseIds = useMemo(
    () => new Set(linkedGpaCourses.map((course) => course.syllabusCourseId)),
    [linkedGpaCourses],
  );

  const builderOverview = useMemo(() => {
    let totalCredits = 0;
    let gradedItems = 0;
    let totalItems = 0;

    for (const entry of courseView) {
      totalCredits += parseInputValue(entry.course.credits) ?? 0;
      gradedItems += entry.gradedItems;
      totalItems += entry.totalItems;
    }

    return {
      courseCount: courseView.length,
      totalCredits,
      gradedItems,
      totalItems,
      completion: totalItems > 0 ? Math.round((gradedItems / totalItems) * 100) : 0,
      syncedCourses: linkedCourseIds.size,
    };
  }, [courseView, linkedCourseIds]);

  useEffect(() => {
    if (hasHydratedCourses) {
      setLinkedGpaCourses(linkedGpaCourses);
    }
  }, [hasHydratedCourses, linkedGpaCourses, setLinkedGpaCourses]);

  function updateCourse(courseId: number, updater: (course: SyllabusCourse) => SyllabusCourse) {
    setCourses((prev) => prev.map((course) => (course.id === courseId ? updater(course) : course)));
  }

  function updateSection(
    courseId: number,
    sectionId: string,
    updater: (section: SyllabusSection) => SyllabusSection,
  ) {
    updateCourse(courseId, (course) => ({
      ...course,
      sections: course.sections.map((section) => (section.id === sectionId ? updater(section) : section)),
    }));
  }

  function handleAddCourse() {
    setCourses((prev) => [...prev, createSyllabusCourse(nextCourseId)]);
    setNextCourseId((prev) => prev + 1);
  }

  function handleRemoveCourse(courseId: number) {
    const removed = courses.find((course) => course.id === courseId);
    setCourses((prev) => prev.filter((course) => course.id !== courseId));
    if (removed) {
      showToast(`Removed "${removed.title || 'Course'}"`, () => {
        setCourses((prev) => [...prev, removed]);
      });
    }
  }

  function handleAddSection(courseId: number) {
    updateCourse(courseId, (course) => ({
      ...course,
      sections: [
        ...course.sections,
        (() => {
          const existingTitles = new Set(course.sections.map((section) => section.title.trim().toLowerCase()));
          const nextPreset = DEFAULT_SYLLABUS_SECTION_PRESETS.find(
            (preset) => !existingTitles.has(preset.title.trim().toLowerCase()),
          );

          if (nextPreset) {
            return createSyllabusSection(nextPreset.title, nextPreset.weight, nextPreset.items, nextPreset.kind);
          }

          return createSyllabusSection(
            `Section ${course.sections.length + 1}`,
            '0',
            [{ title: 'Item 1', maxPoints: 100 }],
            'regular',
          );
        })(),
      ],
    }));
  }

  function handleRemoveSection(courseId: number, sectionId: string) {
    updateCourse(courseId, (course) => {
      if (course.sections.length <= 1) {
        return course;
      }

      return {
        ...course,
        sections: course.sections.filter((section) => section.id !== sectionId),
      };
    });
  }

  function handleAddItem(courseId: number, sectionId: string) {
    updateSection(courseId, sectionId, (section) => {
      const defaultMaxPoints = section.kind === 'attestation' ? 25 : 100;
      return {
        ...section,
        items: [...section.items, createSyllabusItem(nextItemLabel(section, section.items.length), defaultMaxPoints)],
      };
    });
  }

  function handleRemoveItem(courseId: number, sectionId: string, itemId: string) {
    updateSection(courseId, sectionId, (section) => {
      if (section.items.length <= 1) {
        return section;
      }

      return {
        ...section,
        items: section.items.filter((item) => item.id !== itemId),
      };
    });
  }

  return (
    <PageLayout title="Syllabus Builder">
      <div className="card syllabus-overview">
        <div className="syllabus-overview__stats">
          <div className="syllabus-overview__stat">
            <span>Courses</span>
            <strong>{builderOverview.courseCount}</strong>
          </div>
          <div className="syllabus-overview__stat">
            <span>Credits</span>
            <strong>{formatScore(builderOverview.totalCredits, Number.isInteger(builderOverview.totalCredits) ? 0 : 1)}</strong>
          </div>
          <div className="syllabus-overview__stat">
            <span>Progress</span>
            <strong>{builderOverview.totalItems > 0 ? `${builderOverview.completion}%` : '0%'}</strong>
          </div>
          <div className="syllabus-overview__stat">
            <span>GPA Sync</span>
            <strong>{builderOverview.syncedCourses}</strong>
          </div>
        </div>

        <div className="syllabus-overview__actions">
          <button className="btn btn-primary" type="button" onClick={() => setPickerOpen((prev) => !prev)}>
            {pickerOpen ? 'Hide templates' : 'Templates'}
          </button>
          <button className="btn btn-muted" type="button" onClick={handleAddCourse}>
            Add blank course
          </button>
        </div>
      </div>

      {pickerOpen && (
        <div className="card template-picker">
          <div className="template-picker__top">
            <div>
              <h2 className="template-picker__title">Choose courses</h2>
            </div>
            <div className="template-picker__mini">
              <span>{selectedTemplates.size} selected</span>
              <strong>{totalCredits} cr.</strong>
            </div>
          </div>

          <div className="template-picker__group">
            <span className="template-picker__label">Core</span>
            <div className="template-picker__grid">
              {BASE_TEMPLATES.map((template) => (
                <label key={template.key} className={`template-chip${selectedTemplates.has(template.key) ? ' template-chip--active' : ''}`}>
                  <input type="checkbox" checked={selectedTemplates.has(template.key)} onChange={() => toggleTemplate(template.key)} />
                  <span className="template-chip__name">{template.name}</span>
                  <span className="template-chip__credits">{template.credits} cr.</span>
                </label>
              ))}
            </div>
          </div>

          {ELECTIVE_PAIRS.map(({ pair, label, templates }) => (
            <div key={pair} className="template-picker__group">
              <span className="template-picker__label">{label} <span className="template-picker__hint">pick one</span></span>
              <div className="template-picker__grid">
                {templates.map((template) => (
                  <label key={template.key} className={`template-chip template-chip--elective${selectedTemplates.has(template.key) ? ' template-chip--active' : ''}`}>
                    <input type="checkbox" checked={selectedTemplates.has(template.key)} onChange={() => toggleTemplate(template.key)} />
                    <span className="template-chip__name">{template.name}</span>
                    <span className="template-chip__credits">{template.credits} cr.</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="template-picker__footer">
            <span className="template-picker__total">
              {selectedTemplates.size} subject{selectedTemplates.size !== 1 ? 's' : ''} · {totalCredits} credits
            </span>
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleLoadTemplates}
              disabled={selectedTemplates.size === 0}
            >
              Load selected courses
            </button>
          </div>
        </div>
      )}

      <div className="syllabus-list">
        {courseView.length === 0 && !pickerOpen && (
          <div className="card syllabus-empty">
            <span className="syllabus-empty__icon">📋</span>
            <p className="syllabus-empty__text">No courses</p>
            <div className="syllabus-empty__actions">
              <button className="btn btn-primary" type="button" onClick={() => setPickerOpen(true)}>Open templates</button>
              <button className="btn btn-muted" type="button" onClick={handleAddCourse}>Add blank course</button>
            </div>
          </div>
        )}

        {courseView.map((entry) => (
          <article className="card syllabus-card" key={entry.course.id}>
            <div className="syllabus-course-header">
              <div className="syllabus-course-fields">
                <label className="single-field">
                  Course name
                  <input
                    type="text"
                    value={entry.course.title}
                    onChange={(event) =>
                      updateCourse(entry.course.id, (course) => ({ ...course, title: event.target.value }))
                    }
                  />
                </label>

                <label className="single-field syllabus-course-credits">
                  Credits
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="e.g. 5"
                    value={entry.course.credits}
                    onChange={(event) =>
                      updateCourse(entry.course.id, (course) => ({ ...course, credits: event.target.value }))
                    }
                  />
                </label>
              </div>

              <div className="syllabus-course-tools">
                <div className="syllabus-course-chips">
                  <span className="syllabus-chip">{entry.course.sections.length} sections</span>
                  <span className="syllabus-chip">{entry.gradedItems}/{entry.totalItems} graded</span>
                  <span className="syllabus-chip syllabus-chip--accent">{formatScore(entry.weightedTotal, 1)} total</span>
                  {linkedCourseIds.has(entry.course.id) ? <span className="syllabus-chip syllabus-chip--ok">GPA linked</span> : null}
                </div>

                <div className="syllabus-header-actions">
                  <button className="btn btn-muted" type="button" onClick={() => handleAddSection(entry.course.id)}>
                    Add section
                  </button>
                  <button className="remove" type="button" onClick={() => handleRemoveCourse(entry.course.id)}>
                    Remove course
                  </button>
                </div>
              </div>
            </div>

            <div className="syllabus-sections">
              {entry.course.sections.map((section) => {
                const metrics = entry.sectionMetrics.get(section.id);
                const isAttestation = section.kind === 'attestation';
                const metricLabel = getSyllabusSectionMetricLabel(section.kind);
                const sectionPct = isAttestation ? Math.min(metrics?.normalizedScore ?? 0, 100) : 0;

                return (
                  <section className="syllabus-section" key={section.id}>
                    <div className="syllabus-section-header">
                      <input
                        type="text"
                        value={section.title}
                        onChange={(event) =>
                          updateSection(entry.course.id, section.id, (source) => ({
                            ...source,
                            title: event.target.value,
                          }))
                        }
                      />

                      <label className="syllabus-weight">
                        Type
                        <select
                          value={section.kind}
                          onChange={(event) =>
                            updateSection(entry.course.id, section.id, (source) => ({
                              ...source,
                              kind: event.target.value as SyllabusSectionKind,
                            }))
                          }
                        >
                          {SECTION_KIND_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>

                      <label className="syllabus-weight">
                        Weight
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={section.weight}
                          onChange={(event) =>
                            updateSection(entry.course.id, section.id, (source) => ({
                              ...source,
                              weight: event.target.value,
                            }))
                          }
                        />
                      </label>

                      <button
                        className="remove"
                        type="button"
                        onClick={() => handleRemoveSection(entry.course.id, section.id)}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="syllabus-section-meta">
                      <span className="syllabus-chip">
                        {section.kind.charAt(0).toUpperCase() + section.kind.slice(1)}
                      </span>
                      <span className="syllabus-chip">{section.weight || '0'}%</span>
                      <span className="syllabus-chip">
                        {metrics?.gradedItems ?? 0}/{metrics?.totalItems ?? section.items.length} graded
                      </span>
                    </div>

                    {isAttestation && (
                      <div className="syllabus-att-labels">
                      <span>Item</span>
                        <span>Max</span>
                        <span>Score %</span>
                        <span>Earned</span>
                        <span></span>
                      </div>
                    )}

                    <div className="syllabus-items">
                      {section.items.map((item) => {
                        const itemInput = getSyllabusItemInputConfig(section.kind);
                        const scoreValue = parseInputValue(item.score);
                        const maxPoints = parseInputValue(item.maxPoints) ?? (isAttestation ? 25 : 100);
                        const earned = scoreValue !== null ? maxPoints * Math.min(scoreValue, 100) / 100 : null;

                        return isAttestation ? (
                          <div className="syllabus-att-row" key={item.id}>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((sectionItem) =>
                                    sectionItem.id === item.id ? { ...sectionItem, title: event.target.value } : sectionItem,
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              step="1"
                              placeholder="25"
                              value={item.maxPoints}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((sectionItem) =>
                                    sectionItem.id === item.id ? { ...sectionItem, maxPoints: event.target.value } : sectionItem,
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min={itemInput.min}
                              max={itemInput.max}
                              step={itemInput.step}
                              placeholder={itemInput.placeholder}
                              value={item.score}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((sectionItem) =>
                                    sectionItem.id === item.id ? { ...sectionItem, score: event.target.value } : sectionItem,
                                  ),
                                }))
                              }
                            />
                            <span className="syllabus-att-pts">
                              {earned !== null ? formatScore(earned, 1) : '—'}
                            </span>
                            <button
                              className="remove"
                              type="button"
                              onClick={() => handleRemoveItem(entry.course.id, section.id, item.id)}
                            >
                              ×
                            </button>
                          </div>
                        ) : (
                          <div className="syllabus-item-row" key={item.id}>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((sectionItem) =>
                                    sectionItem.id === item.id ? { ...sectionItem, title: event.target.value } : sectionItem,
                                  ),
                                }))
                              }
                            />
                            <input
                              type="number"
                              min={itemInput.min}
                              max={itemInput.max}
                              step={itemInput.step}
                              placeholder={itemInput.placeholder}
                              value={item.score}
                              onChange={(event) =>
                                updateSection(entry.course.id, section.id, (source) => ({
                                  ...source,
                                  items: source.items.map((sectionItem) =>
                                    sectionItem.id === item.id ? { ...sectionItem, score: event.target.value } : sectionItem,
                                  ),
                                }))
                              }
                            />
                            <button
                              className="remove"
                              type="button"
                              onClick={() => handleRemoveItem(entry.course.id, section.id, item.id)}
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="syllabus-section-footer">
                      <button
                        className="btn btn-muted btn-sm"
                        type="button"
                        onClick={() => handleAddItem(entry.course.id, section.id)}
                      >
                        Add item
                      </button>

                      {isAttestation ? (
                        <div className="syllabus-att-summary">
                          <span className="syllabus-att-summary__score">
                            {formatScore(metrics?.score ?? 0, 1)}<span className="syllabus-att-summary__max">/{formatScore(metrics?.maxPointsSum ?? 0, 0)}</span>
                          </span>
                          <span className="syllabus-att-summary__pct">{formatScore(sectionPct, 1)}%</span>
                          <span className="syllabus-att-summary__contrib">→ {formatScore(metrics?.contribution ?? 0, 1)}</span>
                        </div>
                      ) : (
                        <div className="syllabus-metrics">
                          <span>
                            {metricLabel}: <strong>{formatScore(metrics?.score ?? 0)}</strong>
                          </span>
                          <span>
                            Contribution: <strong>{formatScore(metrics?.contribution ?? 0)}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    {metrics?.kind === 'attestation' && metrics.maxPointsMismatch ? (
                      <p className="message message-warn" style={{ margin: 0, fontSize: 13 }}>
                        Max points sum to {formatScore(metrics.maxPointsSum, 0)}. Use either {ATTESTATION_SECTION_MAX} or the section weight ({section.weight || '0'}).
                      </p>
                    ) : null}

                    {(() => {
                      const graded = metrics?.gradedItems ?? 0;
                      const total = metrics?.totalItems ?? section.items.length;
                      const percentage = total > 0 ? Math.round((graded / total) * 100) : 0;
                      return (
                        <div className="progress-bar-container">
                          <div className="progress-bar">
                            <div
                              className={`progress-bar-fill${percentage === 100 ? ' complete' : ''}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="progress-bar-label">{graded}/{total}</span>
                        </div>
                      );
                    })()}
                  </section>
                );
              })}
            </div>

            <div className="syllabus-summary">
              {entry.formulaBreakdown ? (
                <div className="syllabus-formula">
                  <span className="syllabus-formula__label">Formula:</span>
                  <span className="syllabus-formula__expr">
                    {formatScore(entry.formulaBreakdown.att1Weight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.att1Score, 1)}</strong>
                    {' + '}
                    {formatScore(entry.formulaBreakdown.att2Weight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.att2Score, 1)}</strong>
                    {' + '}
                    {formatScore(entry.formulaBreakdown.finalWeight / 100, 1)} × <strong>{formatScore(entry.formulaBreakdown.finalScore, 1)}</strong>
                    {' = '}
                    <strong>{formatScore(entry.formulaBreakdown.total)}</strong>
                  </span>
                </div>
              ) : null}

              <div className="stats-grid">
                <div className="stat">
                  <span>Total Weight</span>
                  <strong>{formatScore(entry.totalWeight)}</strong>
                </div>
                <div className="stat">
                  <span>Total Result</span>
                  <strong>{formatScore(entry.weightedTotal)}</strong>
                </div>
                <div className="stat stat-highlight">
                  <span>Letter Grade</span>
                  <strong>{entry.letter ? entry.letter.letter : '-'}</strong>
                </div>
                <div className="stat">
                  <span>Traditional Grade</span>
                  <strong>{entry.letter ? entry.letter.traditional : '-'}</strong>
                </div>
              </div>

              {entry.hasInvalidWeights ? (
                <p className="message message-warn">Some section weights are invalid. Use values from 0 to 100.</p>
              ) : null}

              {entry.hasWeightMismatch ? (
                <p className="message message-warn">Weight sum is {formatScore(entry.totalWeight)}. It must be exactly 100%.</p>
              ) : null}

              {entry.hasAttestationOverflow ? (
                <p className="message message-warn">One or more attestation sections exceed 100 points. Excess points are capped.</p>
              ) : null}

              {linkedCourseIds.has(entry.course.id) ? (
                <p className="message message-ok">This course is linked to GPA using the current syllabus total and credits.</p>
              ) : null}

              <p className={`message ${entry.statusTone === 'ok' ? 'message-ok' : 'message-warn'}`}>{entry.statusText}</p>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
