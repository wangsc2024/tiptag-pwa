
import { describe, it, expect } from 'vitest';
import { templates } from './templates';

describe('Templates Service', () => {
    it('should export an array of templates', () => {
        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
    });

    it('should have required properties on each template', () => {
        templates.forEach(template => {
            expect(template.id).toBeDefined();
            expect(template.name).toBeDefined();
            expect(template.description).toBeDefined();
            expect(template.content).toBeDefined();
        });
    });

    it('should have Meeting Notes template', () => {
        const meetingNotes = templates.find(t => t.name === 'Meeting Notes');
        expect(meetingNotes).toBeDefined();
        expect(meetingNotes?.content).toContain('Meeting Notes');
    });

    it('should have Daily Journal template', () => {
        const journal = templates.find(t => t.name === 'Daily Journal');
        expect(journal).toBeDefined();
        expect(journal?.content).toContain('Journal');
    });

    it('should have Project Plan template', () => {
        const projectPlan = templates.find(t => t.name === 'Project Plan');
        expect(projectPlan).toBeDefined();
        expect(projectPlan?.content).toContain('Project');
    });

    it('should have Bug Report template', () => {
        const bugReport = templates.find(t => t.name === 'Bug Report');
        expect(bugReport).toBeDefined();
        expect(bugReport?.content).toContain('Bug');
    });

    it('should have unique template IDs', () => {
        const ids = templates.map(t => t.id);
        const uniqueIds = [...new Set(ids)];
        expect(ids.length).toBe(uniqueIds.length);
    });

    it('should have valid HTML content in templates', () => {
        templates.forEach(template => {
            // Check for basic HTML structure
            expect(template.content).toContain('<');
            expect(template.content).toContain('>');
        });
    });
});
