# Live QA Validator Incognito 0.1.16 — isolated DevTools context for targets

Changes: target URLs are now opened with the chrome-devtools MCP `new_page`
tool using a run-unique `isolatedContext` (`liveqa-<JIRA-KEY>-<timestamp>`),
giving a clean cookie/storage state per run instead of a normal tab.
Additional target URLs share the same context. Viewports are set with
`emulate`, live evidence uses `take_screenshot`, and A/B re-bucketing now
opens a fresh isolated context instead of switching browser surfaces. Jira,
Figma and BrowserStack still use the user's signed-in browser. If the
DevTools tools are unavailable, the skill asks before falling back to a
normal tab.

# Live QA Validator Incognito 0.1.11 — recording choice removed

Changes: the recording-choice step has been removed from the
`live-qa-validator-incognito` skill's flow. The skill no longer calls
`open_live_qa_incognito_recording_choice` after the target page opens, no
longer offers "Start recording" / "Skip recording", and no longer looks for
a callable screen recorder or asks the user to start one. The "Open first,
then offer recording" section was renamed "Open the target" and its
recording-choice steps were dropped; the "Restore and close" section no
longer stops a recording; and the Report section's bullet list no longer
asks for a recording link (screenshot links are still included). The run
now goes straight from opening the target to executing the approved
validation matrix.

# Live QA Validator Incognito 0.1.10 — merged device picker, refreshed BrowserStack catalog

Changes: the intake form's separate "Device" dropdown (Desktop/Mobile/Desktop
& Mobile) and "Also test on a real BrowserStack device" dropdown have been
merged into a single "Device(s) to test" multi-select — a "Primary pass"
group (Desktop, Mobile) plus a "Real devices — BrowserStack" group with the
same device-family structure as before, every option now a checkbox instead
of a radio-style select, so any number of BrowserStack devices can be picked
in one run instead of just one. The submitted intake document's `device`
field changed shape from `"desktop"|"mobile"|"both"` plus a separate
`browserstackDevice` (`null` or a single device object) to a single
`{standard: string[], browserstack: Array<{label, os, osVersion, device,
browser}>}`. `SKILL.md` updated to match: the intake-field list, the viewport
section, and the "Optional real-device check" section now loop over every
entry in `device.browserstack` (one supplementary BrowserStack Live pass and
one "Supplementary Run" report section per device) instead of assuming at
most one.

The BrowserStack device catalog was also cross-checked against BrowserStack's
current Live device/browser listing and refreshed: removed iPad Mini 2021
(BrowserStack Live now only offers an old iPad Mini 4 on iOS 9.3) and OnePlus
11R (no OnePlus models currently offered); replaced Xiaomi 12 with Redmi Note
14 Pro 5G (Android 15, Chrome); and added current flagships — iPhone 17 Pro
Max (iOS 26), iPhone 16 (iOS 18), Samsung Galaxy S26 Ultra and S25 Ultra
(Android 16/15, Chrome), Samsung Galaxy Tab S11 (Android 16, Chrome), Google
Pixel 10 (Android 16, Chrome), and macOS Sequoia (Safari and Chrome).

# Live QA Validator Incognito 0.1.9 — acceptance criteria required only for New Test

Changes: the intake form's "Acceptance criteria" field is now required only
when Validation type is set to New Test; switching to Re-QA marks it optional
(the label shows "(optional)" and the field's `required` attribute toggles
live via JS). `SKILL.md` updated to match: Re-QA submissions may leave this
field blank, since the Jira description stays authoritative there and any
submitted text is only supplemental context.

# Live QA Validator Incognito 0.1.8 — acceptance criteria collected at intake

Changes: the intake form gained a required "Acceptance criteria" textarea.
Acceptance criteria for `new_test` validations is now supplied directly by
the user at intake, instead of being discovered by locating and reading a
Cosmos link from the Jira issue's dedicated Details-panel fields — that
automatic Cosmos discovery has been removed from `SKILL.md` (Figma discovery
from Jira is unchanged). The Prepare step that used to locate and read the
Cosmos page now reads the submitted `acceptanceCriteria` text thoroughly
instead, and the execution-matrix source label changed from `Cosmos` to
`Intake acceptance criteria`. For `re_qa`, the Jira issue description remains
the authoritative source; the submitted acceptance criteria there is treated
only as supplemental context, the same way Cosmos previously was. The Report
section's "Cosmos acceptance-criteria URL" line was replaced with a note that
acceptance criteria was supplied directly at intake.

# Live QA Validator Incognito 0.1.7 — fix intake form path resolution

Changes: `SKILL.md` told Claude to publish `assets/intake-form.html` relative
to the skill's own folder (`skills/live-qa-validator-incognito/assets/...`),
but the file actually lives at the plugin root's `assets/` directory —
a sibling of `skills/`, not nested inside it. This caused the intake form
publish step to fail to locate the file. `SKILL.md` now points at
`${CLAUDE_PLUGIN_ROOT}/assets/intake-form.html` instead. No behavior change
to the form itself.

# Live QA Validator Incognito 0.1.5 — optional BrowserStack real-device pass

Changes: added an "Also test on a real BrowserStack device" dropdown to the
intake form (grouped by device family: iPhone, iPad, Android — Samsung/Google
Pixel/Other brands, Desktop — macOS, Desktop — Windows), each option carrying
the `os`/`os_version`/`device`/`device_browser` params needed to open a
BrowserStack Live session. When a device is selected, the skill now runs a
single supplementary real-device pass on BrowserStack Live after the primary
browser-tab validation — opening the session, navigating to the target,
handling cookie consent and a possible geography gate (one "Change Location"
workaround attempt before recording it as Blocked/environmental), spot-checking
the key requirements, and folding the outcome into the report as a
"Supplementary Run — Real-Device Check" section. Leaving the dropdown on
"None" skips this pass entirely, matching prior behavior. Intake still never
collects credentials; BrowserStack sign-in is handled the same way as any
other authenticated surface.

# Live QA Validator Incognito 0.1.4 — normal-tab target flow

Changes: the "Open first, then offer recording" and "Execute" steps in the
`live-qa-validator-incognito` skill no longer drive the Codex-specific
`node_repl` / `@oai/sky` native-window keyboard flow to open a fresh Chrome
Incognito window. That tooling isn't present in every environment. The skill
now opens the target URL in a normal (non-incognito) tab using whichever
browser automation tool is actually available — the Claude in Chrome
extension, or the Claude desktop built-in browser pane — and reports the
lack of a clean/incognito baseline as a limitation instead of claiming reset
cookies. Intake, Jira/Cosmos/Figma discovery, the recording-choice panel,
matrix execution, restore, and reporting are unchanged.

# Live QA Validator Incognito 0.1.3 — MCP Apps panel fix

Replace the earlier plugin with this ZIP in Claude, then start a new Cowork task and request the intake panel. No npm install is needed; Node.js must be available to the plugin runtime.

Changes: replaced window.openai with the official MCP Apps App client, added initialization and automatic resizing, migrated tool calls to callServerTool and follow-ups to sendMessage, declared UI resource MIME types and app-only intake submission visibility, added connection and rejection messages, and removed SDK debug logging of form payloads. Buttons remain disabled until initialization succeeds. Server readiness does not claim the panel rendered.

Validation: real SDK handshake and button behavior tested in a simulated host, including initialization failure, rejected intake, rejected follow-up, and recording retry. Extracted ZIP MCP smoke test verifies startup, tools, resource metadata, both intake modes, and missing-Cosmos rejection.

Not yet validated: Claude Desktop upload/hosting and rendering. The browser QA skill still uses Codex-specific node_repl and @oai/sky and requires a separate browser integration port. This release fixes panel code, not the full Incognito automation.

source/ contains readable panel and server sources for review. Runtime uses only scripts/server.mjs. The source files are not standalone build outputs.