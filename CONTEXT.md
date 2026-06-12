# Socially

Socially is a community events platform where people discover activities, manage participation, and build trust through profiles and reviews.

## Language

**Authentication Flow**:
The entry flow where a Visitor becomes an authenticated User via Login or Registration.
_Avoid_: Auth screens, login module

**Login**:
The action where an existing User proves identity to access a personalized experience.
_Avoid_: Sign in process, entering app

**Registration**:
The action where a Visitor creates a new User identity in Socially.
_Avoid_: Signup form, onboarding

**Registration Consent**:
The explicit agreement by a Visitor to Terms and Privacy Policy required to complete Registration.
_Avoid_: Terms checkbox, legal checkbox

**Visitor**:
A person using Socially without an authenticated session.
_Avoid_: Guest user, anonymous account

**User**:
A person with an identity in Socially who can access personalized features.
_Avoid_: Account, member profile

**Public Screen**:
A screen available to a Visitor without an authenticated session.
_Avoid_: Open route, unauth page

**Authenticated Area**:
Screens available only to a User after completing the Authentication Flow.
_Avoid_: Private routes, logged-in section

**Auth Session**:
The proof that a User is currently authenticated, used to access the Authenticated Area.
_Avoid_: Full app state, user cache

**Session Persistence Preference**:
The User choice that decides whether Auth Session persists across browser restarts.
_Avoid_: Remember me checkbox, stay signed in toggle

**Discover**:
The screen where a User browses available events and chooses what to inspect next.
_Avoid_: Feed, listing page

**Discover Map**:
The map panel inside Discover that visualizes Event locations as selectable pins synchronized with the event list.
_Avoid_: Geosearch backend, static map image

**Event Pin**:
The map marker representing one Event on Discover Map.
_Avoid_: Venue marker, generic point

**Selected Event**:
The currently focused Event shared between Discover list cards and Discover Map interactions.
_Avoid_: Active card only, highlighted pin only

**Discover Filters**:
The set of User-provided criteria that narrows Discover results (search text, category, price, and date range).
_Avoid_: Backend query builder, advanced search engine

**Event Details**:
The detailed view of a single event, including participation-relevant information.
_Avoid_: Event card, event preview

**Public Profile**:
A profile view shown to other Users, focused on trust and reputation signals.
_Avoid_: Contact card, account page

**My Profile**:
The profile view where a User manages their own visible identity information.
_Avoid_: Settings page, account backend

**Event Management**:
The area where a User creates events and manages events they own.
_Avoid_: Admin panel, organizer backend

**Notification Center**:
The place where a User reviews in-app updates relevant to their activity.
_Avoid_: System alerts, push gateway

## Example dialogue

Developer: "Can a Visitor open event management directly?"
Domain expert: "No, a Visitor must complete the Authentication Flow first."
Developer: "So Login is for existing Users and Registration is only for new Users?"
Domain expert: "Exactly."
