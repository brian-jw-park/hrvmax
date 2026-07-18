# HRVMax Product Requirements Document

Status: Draft v0.1  
Last updated: July 18, 2026  
Working title: HRVMax  
Product type: Web app  
Initial data source: Oura API V2

## 1. Product Thesis

HRVMax is a clean personal recovery dashboard for Oura users, with a future close-friends layer. It should feel like Flighty for sleep and recovery: precise, elegant, glanceable, and useful the moment something changes.

Oura already collects valuable data, but the app experience can feel visually flat, over-explained, and too focused on individual metrics. HRVMax should make the same class of data feel more alive by combining:

- A better personal dashboard
- A close-friends recovery board
- Baseline-relative comparison
- Personal retrospectives and "Wrapped-style" summaries
- A design system that feels premium, calm, and information-dense

The product should not feel medical, clinical, or like a generic wellness dashboard. It should feel like a beautifully designed status system for your body and your closest people.

## 2. Goals

### 2.1 Product Goals

- Give users a better daily read on sleep, readiness, HRV, and recovery than the Oura app.
- Make personal sleep and recovery data easier to understand than it is in the Oura app.
- Keep the first prototype local and personal before adding login, OAuth, or friends.
- Create a habit loop that makes users check the app daily or several times per week.
- Build the foundation for future data sources, while starting with Oura only.

### 2.2 Project Goals

- Build something fun, personal, and genuinely nicer to use than the Oura app.
- Validate whether the dashboard feels useful with one user's data before expanding the product surface.
- Keep the architecture clean enough that social features, Oura OAuth, and other integrations can be added later.
- Avoid premature monetization, subscription strategy, or growth mechanics.

### 2.3 Non-Goals

- Do not integrate Apple HealthKit in the first version.
- Do not build an iOS app in the first version.
- Do not build login, accounts, or full Oura OAuth in the first local prototype.
- Do not build leaderboards, competitions, or stored streak systems in the MVP.
- Do not provide medical diagnosis, treatment advice, or health risk predictions.
- Do not train models on user Oura data.
- Do not expose public profiles or broad social discovery in the MVP.
- Do not build a full quantified-self notebook in the MVP.
- Do not optimize for business viability in the MVP.

## 3. Target Users

### 3.1 Primary User

A health-conscious Oura user who already checks sleep, readiness, HRV, or recovery data, but wants a better interface and more social context.

Typical traits:

- Owns an Oura Ring
- Checks recovery or sleep data frequently
- Cares about routines, performance, training, travel, productivity, or social motivation
- Has friends who also use wearables
- Is comfortable sharing personal data with a small trusted circle

### 3.2 Secondary User

A small friend group, couple, founder group, training group, or high-agency social circle that wants shared accountability around sleep and recovery.

### 3.3 Future Users

- Athletes and coaches
- Remote teams
- Biohacking communities
- Couples and families
- Frequent travelers managing recovery and jet lag

## 4. Positioning

### 4.1 One-Liner

HRVMax is a beautiful personal dashboard for Oura users to understand sleep, HRV, readiness, and recovery trends, with friend sharing added later.

### 4.2 Mental Model

Flighty for recovery.

Flighty works because it makes complex, delayed, high-stakes travel information feel obvious and always available. HRVMax should do the same for body data:

- Put the most important status up front.
- Make updates and delays understandable.
- Eventually show friends' status without requiring heavy navigation.
- Use restrained, polished visuals instead of wellness-app clutter.
- Make the interface feel confident enough that it does not need to over-explain itself.

### 4.3 Better Design Inspiration Than Oura

Use Oura as a data source, not as the design benchmark.

Better references:

- Flighty: status-first layout, premium utility, dense but calm information hierarchy.
- Apple Fitness / Activity rings: instantly readable progress states and daily rhythm.
- Strava: social proof, personal records, lightweight competition, weekly loops.
- Whoop: recovery framing and strain/recovery language, but with a cleaner social model.
- Linear: restrained interface, crisp typography, elegant density, fast navigation.
- Arc browser: polished product feel, strong visual identity, subtle motion.
- iOS Live Activities: glanceable state, persistent context, not too much explanation.
- Apple Health trends: quiet long-range pattern detection.

## 5. MVP Scope

### 5.1 Included

- Local-first personal dashboard
- Local data import or seeded local data while Oura OAuth is deferred
- Personal recovery dashboard
- Baseline-relative metrics
- Daily, weekly, and monthly views
- Personal recap moments such as longest sleep, shortest sleep, best recovery day, and roughest night
- Responsive web UI
- Clean design prototype that establishes the product's visual language

### 5.2 Excluded From MVP

- Login and account management
- Production Oura OAuth
- Friend system with mutual acceptance
- Friend dashboard
- Leaderboards and lightweight competition
- Stored streaks or achievement systems
- Apple HealthKit
- Strava, Garmin, Fitbit, Whoop, Eight Sleep, or manual CSV imports
- Public profiles
- Comments or feed-style posts
- AI coaching
- Medical insights
- Paid subscriptions
- Native mobile app
- Complex privacy matrix

## 6. Privacy and Sharing Model

The first prototype is local and personal, so it does not need a full social privacy system yet. The social model below describes the intended direction once accounts and friendships are added.

### 6.1 Product Decision

For the first social version after the personal prototype, mutual friends can see each other's full HRVMax dashboard by default.

This is intentionally different from a granular privacy-first social model. The assumption is:

If two people intentionally become friends inside HRVMax, they are choosing a trusted sharing relationship.

However, this must be implemented as explicit consent, not an invisible default.

### 6.2 Friendship Consent UX

When a user sends or accepts a friend request, the product must clearly state:

"Friends can see your sleep, readiness, HRV, resting heart rate, recovery trends, daily history, and other Oura metrics shown in HRVMax."

Acceptance of a friend request means:

- The accepter can see the requester's shared dashboard.
- The requester can see the accepter's shared dashboard.
- Both users can remove the friendship at any time.
- Removing a friend immediately revokes dashboard access.

### 6.3 Social Version Privacy Defaults

- Friends see everything displayed in HRVMax.
- Non-friends see nothing.
- There are no public profiles.
- Friend requests must be accepted before data is shared.
- Users can remove friends.
- Users can disconnect Oura.
- Users can delete their account and data.

### 6.4 Future Privacy Controls

Granular sharing can come later if users ask for it or if the product expands beyond close friends.

Potential future controls:

- Hide HRV
- Hide temperature deviation
- Hide exact sleep and wake times
- Share weekly aggregates only
- Incognito day
- Group-specific sharing
- Private notes and tags

### 6.5 Compliance Notes

Oura requires user consent for access and processing of user data. Oura's API agreement also states that an app must not grant someone other than the user the right to see that user's data without prior express consent. HRVMax therefore needs explicit friend-acceptance copy and a privacy policy before broader testing.

Relevant sources:

- Oura API V2 docs: https://cloud.ouraring.com/v2/docs
- Oura OAuth docs: https://cloud.ouraring.com/docs/authentication
- Oura API and MCP Agreement: https://cloud.ouraring.com/legal/api-agreement

## 7. Core User Stories

### 7.1 Onboarding

- As a local prototype user, I want to load sample or local Oura data so I can see the dashboard quickly.
- As a local prototype user, I want the app to work without creating an account.
- As a future user, I want to connect my Oura account so HRVMax can show my recovery data automatically.
- As a future user, I want to understand that connecting Oura grants access to health-adjacent data.

### 7.2 Personal Dashboard

- As a user, I want to see my recovery status today.
- As a user, I want to know whether my HRV, sleep, readiness, and resting HR are above or below my baseline.
- As a user, I want to see what changed from yesterday.
- As a user, I want to scan my week without reading a lot of text.
- As a user, I want to know whether I am trending better or worse over time.

### 7.3 Social Dashboard

- As a user, I want to add friends who also use Oura.
- As a user, I want accepted friends to see my recovery dashboard.
- As a user, I want to see my friends' sleep, readiness, HRV, and recovery trends.
- As a user, I want to compare daily and weekly recovery in a way that feels fun.
- As a user, I want to remove a friend and revoke their access.

### 7.4 Personal Recaps

- As a user, I want to see my longest and shortest sleep nights.
- As a user, I want to see my best recovery day and roughest night.
- As a user, I want to see weekly and monthly summaries that feel fun to revisit.
- As a user, I want recap stats to be computed from daily data rather than stored as separate streak or achievement records.

## 8. Key Screens

### 8.1 Local Data Start

Purpose: Let the first prototype show a real dashboard before login and OAuth exist.

Requirements:

- Use local sample data or a local exported/imported dataset.
- Show whether the current data is sample data or real local data.
- Keep the interface shaped like the future connected product.
- Defer account creation, Oura OAuth, token storage, and background sync.
- Include empty/loading/error states that can later be reused for Oura sync.

### 8.2 Personal Today Dashboard

Purpose: The default daily view.

Primary elements:

- Top status: recovered, neutral, strained, low battery, or syncing
- Sleep score
- Readiness score
- HRV average
- Resting heart rate
- Sleep duration
- Temperature deviation if available
- Last synced timestamp
- Change from baseline
- Change from yesterday

UX requirement:

The first viewport should answer "How am I doing today?" in less than five seconds.

### 8.3 Personal Week View

Purpose: Show trend and rhythm.

Primary elements:

- Seven-day recovery strip
- Sleep duration trend
- Readiness trend
- HRV trend
- Resting HR trend
- Best day / worst day
- Weekly average vs previous week

### 8.4 Personal Month View

Purpose: Pattern recognition.

Primary elements:

- Calendar heatmap
- Sleep consistency
- Average recovery by week
- Outlier days
- Recap callouts such as longest sleep, shortest sleep, best recovery day, and roughest night

### 8.5 Future Friends Board

Purpose: The social home screen after accounts and friendships are added.

Primary elements:

- Friend status cards
- Current sleep score
- Current readiness score
- HRV vs baseline
- Sleep duration
- Recovery state
- Last synced timestamp
- "No data yet" and "syncing" states

Example card:

Alex  
Sleep 91, Readiness 86  
HRV +12% vs baseline  
7h 48m sleep  
Best night this week

### 8.6 Future Friend Detail

Purpose: View a friend's full shared dashboard.

Requirements:

- Same core views as personal dashboard
- Clear label that this is a friend's data
- Last synced timestamp
- Remove friend action

### 8.7 Personal Recaps

Purpose: Make the dashboard feel memorable and fun without adding competition.

MVP recap modules:

- Longest sleep
- Shortest sleep
- Best sleep score
- Best readiness day
- Lowest resting heart rate night
- Highest HRV night
- Most consistent sleep window
- Biggest recovery rebound

Implementation rule:

Recap facts should be computed from `daily_metrics` and not stored as separate streak, badge, or achievement rows.

### 8.8 Settings

Requirements:

- Local data source status
- Toggle sample vs imported local data if both exist
- Clear local data action if local imports are supported
- Future: Oura connection status
- Future: disconnect Oura
- Future: manage friends
- Future: delete account
- Future: privacy policy and terms links

## 9. Metrics and Data

### 9.1 Future Oura Scopes

Potential requested scopes for the connected version:

- email
- personal
- daily
- heartrate
- workout
- tag
- session
- spo2

The local MVP does not need Oura scopes. The connected version can start with fewer scopes if necessary, but full-dashboard friend sharing is more compelling if the app has access to daily summaries, heart rate, workouts, tags, sessions, and SpO2.

Oura notes that users can approve a subset of requested scopes, so the app must handle missing data gracefully.

### 9.2 Oura-Shaped Data Types To Use

Priority 1:

- Daily sleep
- Sleep score
- Readiness score
- HRV average
- Resting heart rate
- Sleep duration
- Sleep efficiency
- Bedtime and wake time
- Temperature deviation

Priority 2:

- Activity summary
- Workouts
- Stress
- SpO2
- Respiratory rate
- Sessions
- Tags

Priority 3:

- Heart rate time series
- Detailed sleep stages
- Ring configuration and battery

### 9.3 Derived Metrics

HRVMax should compute its own derived metrics while preserving raw Oura data.

Derived metrics:

- 7-day average
- 30-day baseline
- Percent above or below baseline
- Sleep consistency score
- Sleep debt estimate
- Comeback score
- Weekly recovery average
- Best day of week
- Volatility score
- Longest sleep
- Shortest sleep
- Best recovery day
- Roughest night

### 9.4 Baseline Calculation

Initial baseline:

- Use trailing 30 days when available.
- If fewer than 30 days are available, use available history and mark baseline as provisional.
- Do not compare users solely by raw HRV.
- Prefer percent difference from personal baseline.

## 10. Data Sync Requirements

### 10.1 Local Prototype Data Behavior

- Load from sample data or a local file.
- Keep data normalized in the same shape expected from Oura.
- Make it easy to replace local data with Oura sync later.
- Show a local data timestamp or fixture label.

### 10.2 Future Sync Behavior

- Sync after OAuth connection.
- Run scheduled background sync at least daily.
- Allow manual refresh.
- Store last successful sync timestamp.
- Show stale data indicators.
- Handle data changing after initial sync.

### 10.3 Lag Expectations

Oura data is not real-time. Data depends on ring-to-phone sync, Oura app sync, and Oura cloud processing. The app should assume that morning data may be delayed, incomplete, or later revised.

UX requirements:

- Always show last synced time.
- Use "syncing" and "waiting for Oura" states.
- Avoid implying real-time precision.
- Re-sync recent days because Oura summaries may change after naps, workouts, edits, or delayed syncs.

### 10.4 Refresh Window

On every scheduled sync:

- Fetch the last 14 days for daily summaries.
- Fetch the last 3 days for time-series data.
- Fetch older history during initial backfill.

Rationale:

Recent data is most likely to change. Historical backfill is needed for baselines.

## 11. Technical Requirements

### 11.1 Recommended Stack

- Next.js web app
- TypeScript
- Local JSON fixtures or local SQLite for the first prototype
- Lightweight charting library
- Vercel or similar hosting once it becomes shareable

Future connected version:

- Supabase Auth
- Postgres
- Prisma or Drizzle
- Background jobs through Supabase scheduled functions, Trigger.dev, Inngest, or a simple cron worker

### 11.2 Core Tables

The local prototype does not need production tables yet. These tables describe the likely connected version after login, Oura OAuth, and friends are added.

users:

- id
- email
- display_name
- avatar_url
- created_at
- deleted_at

oura_connections:

- id
- user_id
- oura_user_id
- access_token_encrypted
- refresh_token_encrypted
- granted_scopes
- token_expires_at
- last_synced_at
- connection_status
- created_at
- updated_at

daily_metrics:

- id
- user_id
- source
- date
- sleep_score
- readiness_score
- hrv_avg
- resting_hr
- sleep_duration_minutes
- sleep_efficiency
- bedtime_start
- bedtime_end
- temperature_deviation
- respiratory_rate
- spo2_avg
- raw_payload
- created_at
- updated_at

friendships:

- id
- requester_id
- addressee_id
- status
- accepted_at
- created_at
- updated_at

friendship_consents:

- id
- friendship_id
- user_id
- consent_version
- consented_at
- revoked_at

sync_runs:

- id
- user_id
- source
- started_at
- completed_at
- status
- error_code
- error_message

### 11.3 Security Requirements

For the local prototype:

- Do not commit real personal health data.
- Keep real local data ignored by git if imported.
- Do not send data to external services.

For the future connected version:

- Encrypt OAuth tokens at rest.
- Never expose Oura tokens to the client.
- Use server-side OAuth code exchange.
- Rotate single-use refresh tokens correctly.
- Log sync failures without logging sensitive token values.
- Require authentication for every dashboard route.
- Authorize every friend-data request by checking accepted friendship status.
- Delete user data within the product's committed deletion window.

### 11.4 API Constraints

Oura OAuth:

- Authorize URL: https://cloud.ouraring.com/oauth/authorize
- Token URL: https://api.ouraring.com/oauth/token
- Access tokens must be sent as bearer tokens.
- Refresh tokens are single-use and must be replaced after refresh.
- Users can grant fewer scopes than requested.

## 12. Design Direction

### 12.1 Design Principles

- Status first: the user should instantly know the state.
- Dense but calm: show real information without clutter.
- Premium utility: beautiful, but never decorative at the expense of clarity.
- Personal first, social later: the dashboard should be compelling before friend data exists.
- Baseline over bio-comparison: use personal context before comparing people.
- Trust by design: consent and data visibility must be obvious.

### 12.2 Visual Language

Preferred feel:

- Clean, crisp, elegant
- High contrast where it matters
- Soft neutral base
- Strong accent colors only for state
- Excellent typography
- Sharp spacing
- Small, refined motion
- Data visualizations that look editorial and precise

Avoid:

- Generic wellness gradients
- Overly soft pastel health UI
- Purple-blue dashboard sameness
- Huge marketing cards
- Cluttered ring charts everywhere
- Medical-app coldness
- Oura imitation

### 12.3 Interface Patterns

- Friend cards
- Horizontal day strips
- Compact charts
- Calendar heatmaps
- Recap callouts
- Status labels
- Tiny trend deltas
- Tooltips for uncommon metrics
- Clear stale/sync states

### 12.4 First Screen Concept

The first prototype home screen should be the user's personal recovery dashboard.

Why:

- It lets the product become useful before login, OAuth, or friends exist.
- It establishes whether the visual system and information hierarchy are actually better than Oura.
- It creates a strong foundation for social sharing later.

Suggested layout:

- Top bar: HRVMax, date, sync status, settings
- Today status strip: sleep, readiness, HRV vs baseline, last data timestamp
- Seven-day recovery strip
- Key metric cards
- Month heatmap
- Recap panel with longest sleep, shortest sleep, best recovery day, and roughest night

## 13. Recaps and Delight

### 13.1 MVP Mechanics

- Longest sleep night
- Shortest sleep night
- Best recovery day
- Lowest resting heart rate night
- Highest HRV night
- Biggest rebound after a rough night
- Weekly and monthly summary cards

### 13.2 Tone

Recaps should feel playful but not juvenile. They should make the data more memorable without turning health into homework.

Preferred language:

- "Recovered"
- "Solid"
- "Rough night"
- "Trending up"
- "Above baseline"
- "Comeback"
- "Best night"
- "Roughest night"
- "Longest sleep"

Avoid:

- "Failure"
- "Unhealthy"
- "Bad body"
- Medicalized warnings
- Pushy coaching

### 13.3 Future Social Mechanics

Leaderboards, challenges, and streaks can be revisited after the personal dashboard feels strong. If added later, streaks should be computed from daily metrics instead of stored as separate database objects unless there is a strong product reason to persist them.

## 14. Notifications

Notifications are not required for MVP, but should be considered soon after.

Future notification ideas:

- Your sleep data is ready.
- Your HRV rebounded.
- Weekly recap is ready.
- Monthly recap is ready.

Do not notify users every time a friend has a bad night.

## 15. Success Metrics

### 15.1 Activation

- Time from opening the local prototype to first useful dashboard
- Percentage of local datasets that render without errors
- Percentage of key dashboard sections populated

### 15.2 Engagement

- Personal dashboard views
- Week/month view interactions
- Recap panel interactions
- Repeat local usage over several days

### 15.3 Social

Social metrics apply only after friends are added.

- Friend requests sent per active user
- Friend acceptance rate
- Users with at least one friend
- Users with at least three friends
- Repeat visits after adding a friend

### 15.4 Retention

Retention metrics apply only after the app has accounts or repeated local usage can be measured.

- D1, D7, D30 retention
- Weekly return rate
- Retention by number of friends

### 15.5 Trust

Trust metrics apply only after accounts and Oura connection exist.

- Oura disconnect rate
- Account deletion rate
- Friend removal rate
- Support tickets or complaints about privacy

## 16. MVP Milestones

### Milestone 1: Local Foundation

- App shell
- Local data shape
- Sample/fixture data
- Metric normalization helpers
- Responsive layout foundation

### Milestone 2: Personal Dashboard

- Daily metrics
- Today view
- Week view
- Month view
- Baseline calculations
- Local data status
- Empty/loading/error states

### Milestone 3: Recaps and Polish

- Longest sleep
- Shortest sleep
- Best recovery day
- Roughest night
- Biggest rebound
- Visual polish
- Responsive polish

### Milestone 4: Oura Connection

- Oura OAuth
- Token storage
- Initial Oura sync
- Manual refresh
- Stale data states

### Milestone 5: Social Graph

- Auth
- Friend request flow
- Acceptance consent copy
- Friends board
- Friend detail dashboard
- Remove friend flow
- Privacy policy
- Account deletion
- Oura disconnect

## 17. Open Questions

- What local data format should the first prototype use: hand-authored fixture JSON, downloaded Oura export, or a small manually entered dataset?
- Should the first dashboard optimize for desktop, mobile, or both equally?
- Which recap moments are most delightful: longest sleep, shortest sleep, best recovery day, roughest night, biggest rebound, or something weirder?
- Should HRVMax ask for all Oura scopes upfront, or start with the minimum needed for a cleaner consent screen?
- Should accepted friends see tags and sessions, or should "everything" mean all dashboard metrics except raw notes/tags?
- Should the default home screen be the Friends Board or Personal Today?
- Should users be able to join groups, or should MVP be only one-to-one friendships?
- Should friend cards show exact bedtime/wake time, or only sleep duration and timing consistency?
- Would calendar or photo integrations make recaps meaningfully better, or would they add too much permission and product complexity too early?

## 18. Risks

### 18.1 Privacy Risk

Users may underestimate how sensitive sleep, HRV, temperature, and readiness data can feel once friends can see it.

Mitigation:

- Explicit consent at friend acceptance
- Clear friend removal
- No public profiles
- No friend-of-friend visibility
- Clear privacy policy

### 18.2 API Risk

Oura access, scopes, approval, rate limits, or terms may constrain the connected version.

Mitigation:

- Build against official Oura API V2
- Store granted scopes
- Handle missing scopes
- Avoid AI training or unauthorized processing
- Keep sync efficient

### 18.3 Social Risk

Future leaderboards can make people feel judged for sleep, travel, parenting, work stress, or illness.

Mitigation:

- Defer leaderboards until the personal dashboard works
- Include baseline-relative comparison if competition is added later
- Use supportive language
- Keep groups private
- Avoid harsh labels

### 18.4 Data Freshness Risk

Oura data can lag or change after sync.

Mitigation:

- Show last sync timestamp
- Re-sync recent days
- Avoid real-time claims
- Use "waiting for Oura" states

## 19. V1+ Ideas

- Groups
- Challenges
- Weekly recap cards
- Monthly or annual "Wrapped-style" recovery recap
- Shareable images
- Push/email notifications
- Travel recovery mode
- Manual notes
- Caffeine/alcohol tracking
- Calendar integration for context around travel, late nights, events, and stressful weeks
- Photo integration for memory-rich recaps, if privacy and permissions feel worth it
- Strava integration
- Garmin integration
- Apple HealthKit through iOS companion app
- Team dashboards
- Coach mode
- Export data
- Advanced correlations

## 20. Build Recommendation

Start with a local personal dashboard using mocked or locally imported Oura-shaped data.

The product needs to prove that the personal dashboard feels meaningfully better than Oura before adding auth, OAuth, sync, or friends. If the solo dashboard feels polished and useful, social features will have a stronger foundation. If the solo dashboard feels ordinary, friend cards will mostly amplify an ordinary product.

Recommended first prototype:

- Static responsive web app
- My status card
- Seven-day recovery strip
- Month heatmap
- Metric trend cards
- Personal recap panel
- Elegant visual system inspired by Flighty, Linear, and Apple Fitness

Then replace local data with real Oura OAuth and sync. After that, add login and friends.

## 21. References

- Oura API V2 documentation: https://cloud.ouraring.com/v2/docs
- Oura OAuth documentation: https://cloud.ouraring.com/docs/authentication
- Oura API and MCP Agreement: https://cloud.ouraring.com/legal/api-agreement
- Apple's Behind the Design: Flighty: https://developer.apple.com/news/?id=970ncww4
