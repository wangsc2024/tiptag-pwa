export interface Template {
    id: string;
    name: string;
    description: string;
    content: string;
}

export const templates: Template[] = [
    {
        id: 'meeting-notes',
        name: 'Meeting Notes',
        description: 'Standard template for team meetings with agenda and action items.',
        content: `
            <h1>Meeting Notes</h1>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Attendees:</strong> [Name 1], [Name 2]</p>
            
            <h2>Agenda</h2>
            <ul>
                <li>Topic 1</li>
                <li>Topic 2</li>
            </ul>

            <h2>Discussion Points</h2>
            <p>Notes go here...</p>

            <h2>Action Items</h2>
            <ul>
                <li>[ ] Task 1 (@Owner)</li>
                <li>[ ] Task 2 (@Owner)</li>
            </ul>
        `
    },
    {
        id: 'daily-journal',
        name: 'Daily Journal',
        description: 'Track your daily progress, thoughts, and tasks.',
        content: `
            <h1>Daily Journal: ${new Date().toLocaleDateString()}</h1>
            
            <h3>🧠 Mood / Energy</h3>
            <p>How are you feeling today?</p>

            <h3>✅ Top 3 Priorities</h3>
            <ol>
                <li></li>
                <li></li>
                <li></li>
            </ol>

            <h3>📝 Notes & Reflections</h3>
            <p>Write your thoughts here...</p>
        `
    },
    {
        id: 'project-plan',
        name: 'Project Plan',
        description: 'Outline for a new project with goals and milestones.',
        content: `
            <h1>Project Plan: [Project Name]</h1>
            
            <h2>Overview</h2>
            <p>Brief description of the project and its goals.</p>

            <h2>Objectives</h2>
            <ul>
                <li>Goal 1</li>
                <li>Goal 2</li>
            </ul>

            <h2>Milestones</h2>
            <ul>
                <li><strong>Phase 1:</strong> [Date] - Description</li>
                <li><strong>Phase 2:</strong> [Date] - Description</li>
            </ul>

            <h2>Resources Needed</h2>
            <p>What do we need to succeed?</p>
        `
    },
    {
        id: 'bug-report',
        name: 'Bug Report',
        description: 'Structure for reporting technical issues.',
        content: `
            <h1>Bug Report: [Issue Name]</h1>
            
            <h3>Description</h3>
            <p>What happened?</p>

            <h3>Steps to Reproduce</h3>
            <ol>
                <li>Step 1</li>
                <li>Step 2</li>
            </ol>

            <h3>Expected Behavior</h3>
            <p>What should have happened?</p>

            <h3>Actual Behavior</h3>
            <p>What actually happened?</p>
        `
    }
];