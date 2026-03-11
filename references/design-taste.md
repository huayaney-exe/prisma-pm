<design_taste>

Product-level design evaluation principles for the FEEL layer. Workflows and agents @-reference this file to evaluate design decisions — messaging, information architecture, CTA hierarchy, and visual direction. For CSS/pixel-level implementation craft, see the frontend-taste skill.

<philosophy>

**You are a design editor, not a design generator.**

The PM drives design intent through conversation. Your job is to evaluate that intent against proven design principles and strengthen it. You channel Rio Lou's critique methodology: relentlessly eliminate confusing messaging, distracting layouts, and generic "AI slop" while prioritizing brutal clarity, robust design foundations, and user-centric workflows.

Don't generate generic designs. Critique and sharpen specific ones.

</philosophy>

<the_four_question_test>

Every surface must answer these within 5 seconds of a user arriving:

1. **What is this?** — Clear, jargon-free explanation of the product/feature
2. **Is it for me?** — The target user must see themselves immediately
3. **Does it work?** — Evidence, proof, or demonstration that it delivers
4. **Is it credible?** — Trust signals that make the claim believable

If any answer is unclear, the design fails the test. Fix messaging before touching visuals.

</the_four_question_test>

<messaging_principles>

**Kill the jargon.** Stop using proprietary concepts or big words nobody understands. Talk to target users using the language and problems they already know.

**Literal sub-headlines.** If you use an aspirational or "cute" marketing headline, pair it with a literal sub-headline that explains exactly what the product does and who it's for.

**Lead with the positive.** Focus primary messaging on the value proposition and solution, not negative commands ("stop doing X").

**Old World vs. New World.** Explicitly show the problems users face today and how the product solves them. The transformation must be visible — before and after, side by side.

**Speak to the job.** Messaging should connect to the JTBD from discovery. What is the user hiring this product to do? Say that.

</messaging_principles>

<cta_hierarchy>

**One primary CTA per scroll depth.** Kill all distractions. At every scroll position, there's one main call to action.

**Earn the right to ask.** Don't push pricing, "book a demo," or sign-up walls before explaining the product and providing enough context. Value first, commitment second.

**Delay secondary elements.** Consider hiding secondary buttons until the user scrolls to a relevant section, then animate them in so they grab attention at the right time.

**De-prioritize vanity social proof.** Investor logos should never be larger or more prominent than the product's own identity. Product first, social proof second.

**Commitment ladder.** CTAs should follow a natural escalation: learn more → try free → sign up → pay. Never skip rungs.

</cta_hierarchy>

<information_architecture>

**Narrative arc.** Sections follow: Problem → Solution → Proof → Action. This is the persuasion spine — don't scramble it.

**Scroll peek.** Show ~10px of the next section above the fold. This naturally signals to users that more content exists below. Never lock users in a 100vh hero with no visual cue to scroll.

**Clean section boundaries.** No visual treatments that cause hierarchy confusion — unnecessary dividing lines, cards that break z-index, or random style shifts between sections.

**Consistent component hierarchy.** Elements should feel like parts of the same whole. Don't randomly switch from vibrant colors to black-and-white or change UI styles between marketing and product pages.

**Content type sequencing.** Each section has one job: hero (identity), features (capability), proof (credibility), pricing (commitment), footer (navigation). Don't mix jobs.

</information_architecture>

<ai_ux_patterns>

Apply these when the product includes LLM or AI-powered features:

**Expose the thinking state.** When an LLM is processing, show the user actual states and tool calls as they happen. No generic spinners. No random looping messages.

**Constrain running actions.** While exposing the AI's process, don't overwhelm with a wall of text. Confine running actions to a focusable spot and highlight steps requiring user confirmation.

**Let users play.** Remove immediate friction. Let users try the tool or send a few free messages in a constrained demo before hitting them with a signup wall.

**Transparent confidence.** When AI output has uncertainty, surface it. Don't present probabilistic results as certainties.

</ai_ux_patterns>

<anti_slop_standards>

**Define brand identity BEFORE design.** Start by defining color palette, visual style, and brand goals. Feed these constraints into any design process so the output represents the brand, not a generic AI default.

**Visual continuity mandate.** Brand style, colors, and UI elements must remain consistent across all pages and surfaces. Marketing page and product UI share the same design language.

**Standardize diverse assets.** When using varied assets (headshots, screenshots, partner logos), standardize them — consistent filters, background removal, sizing — so they feel part of a unified design.

**No motion without purpose.** Don't use moving elements when the user is trying to read static text. Animation should steal attention only when it's actually helpful, not when it's distracting.

**Flag generic AI tropes.** Purple gradients, massive shadows, inconsistent border radiuses, default system font mixing, fake dashboard screenshots with red/yellow/green/blue — these are AI slop. Remove them.

</anti_slop_standards>

<design_system_foundations>

The design spec should establish directional foundations that an implementation inherits:

**Color direction.** Primary palette, accent strategy, neutral tones. Not hex values — intent and mood. "Dark, professional, high-contrast with a single warm accent" vs "Light, airy, muted pastels."

**Typography intent.** Hierarchy structure (how many levels), personality (geometric vs humanist vs monospace), density (spacious editorial vs compact dashboard). Not font names — typographic character.

**Component philosophy.** Rounded and friendly vs sharp and precise? Dense information vs breathing room? Card-based vs list-based? These directional choices cascade through every implementation decision.

**Tone of voice.** How the product speaks — formal/casual, technical/accessible, encouraging/neutral. This drives every label, error message, empty state, and onboarding step.

**Interaction philosophy.** Minimal and fast vs rich and explorable? Progressive disclosure vs everything visible? These shape the entire UX.

</design_system_foundations>

<the_editor_mindset>

**Step 1: Define brand identity upfront.** Before any design generation, establish color palette, visual style, and brand goals. This prevents AI defaults from defining the product's identity.

**Step 2: Focus on the hard questions.** Because AI frees you from technical fiddling, use that saved time to rigorously refine messaging and product offering. What are we making? For whom? Why is it valuable?

**Step 3: Act as the editor.** Don't accept all suggested layouts by default. Be an opinionated human-in-the-loop. Evaluate critically: does this layout serve the user, or is it just flashy?

**Step 4: Rigorous human QA.** Test the site meticulously. Interactive elements must work. Text contrast must be readable. Menus must not break over dynamic backgrounds. Scroll behavior must feel natural.

</the_editor_mindset>

<rio_evaluation_checklist>

Invoke this checklist when evaluating any design specification:

1. **The 5-Second Test** — Can I immediately tell what this is, who it's for, and how it's different?
2. **The Jargon Check** — Are they using made-up terms, or speaking the user's actual language?
3. **The Slop Check** — Are there generic AI design indicators (purple gradients, massive shadows, disjointed styles)?
4. **The CTA Audit** — Too many competing buttons? Asking for money/signup before explaining value?
5. **The Hierarchy Check** — Do visual elements make logical sense, or are they disjointed and confusing?
6. **The Wait State Check** — (If AI) Is the UI transparent about processing without being overwhelming?

</rio_evaluation_checklist>

</design_taste>
