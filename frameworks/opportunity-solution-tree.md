# Opportunity Solution Tree (OST)

A visual framework for connecting desired outcomes to discovery opportunities and testable solutions.

## Core Concept

The OST prevents the "solution-first" anti-pattern by forcing a clear hierarchy:

```
Desired Outcome
  └── Opportunity (user need/pain)
        └── Solution (approach to address opportunity)
              └── Experiment (test to validate solution)
```

## Structure

### Level 1: Desired Outcome
The business or product outcome you're trying to achieve.
- Must be measurable
- Must connect to strategy
- Example: "Increase trial-to-paid conversion from 5% to 15%"

### Level 2: Opportunities
User needs, pain points, or desires discovered through research.
- Each opportunity is a potential way to achieve the outcome
- Multiple opportunities can serve the same outcome
- Opportunities come from discovery, not brainstorming
- Example: "Users don't understand the value within the trial period"

### Level 3: Solutions
Specific approaches to address each opportunity.
- Multiple solutions per opportunity (compare options)
- Solutions are hypotheses, not commitments
- Example: "Guided onboarding showing 3 key features in first session"

### Level 4: Experiments
Tests to validate whether a solution addresses the opportunity.
- Each solution should have at least one experiment
- Experiments have pass/fail criteria
- Example: "A/B test guided vs. self-serve onboarding, measure feature discovery rate"

## Building an OST

### Step 1: Set the Outcome
Start with a single measurable outcome from your strategy.

### Step 2: Discover Opportunities
Through research (not brainstorming), identify user needs that could drive the outcome:
- Customer interviews
- Usage analytics
- Support tickets
- Competitive analysis

### Step 3: Generate Solutions
For each opportunity, brainstorm 2-3 solution approaches. Resist the urge to pick one immediately.

### Step 4: Design Experiments
For the most promising solutions, design minimum viable experiments.

## Example OST

```
OUTCOME: Reduce customer churn from 8% to 3% monthly

├── OPPORTUNITY: Users stop using after initial setup
│   ├── Solution: Proactive onboarding check-in at day 3
│   │   └── Experiment: Email sequence test (target: 40% open, 15% re-engagement)
│   └── Solution: Simplified initial workflow template
│       └── Experiment: A/B test template vs. blank start (target: 30% higher day-7 retention)
│
├── OPPORTUNITY: Power users feel limited by current feature set
│   ├── Solution: API access for automation
│   │   └── Experiment: Waitlist landing page (target: 200 signups in 2 weeks)
│   └── Solution: Integration marketplace
│       └── Experiment: Interview 10 power users on integration needs
│
└── OPPORTUNITY: Billing friction causes involuntary churn
    └── Solution: Smart retry logic + dunning emails
        └── Experiment: Implement retry, measure recovery rate (target: 50% recovery)
```

## Rules

1. **Opportunities come from research, not assumptions** — Every opportunity must trace to user evidence
2. **Multiple solutions per opportunity** — If you only have one solution, you haven't explored enough
3. **Experiments before commitment** — Validate before building the full solution
4. **The tree evolves** — Add opportunities as you learn, prune dead branches

## Application in Prisma PM

- `/pm:discover` — Opportunities map to discovery briefs
- `/pm:validate` — Experiments map to validation plans
- `/pm:strategy` — The tree helps visualize which opportunities are most promising
- `/pm:define` — Solutions that pass validation become PRDs

## Further Reading

- Teresa Torres — "Continuous Discovery Habits"
