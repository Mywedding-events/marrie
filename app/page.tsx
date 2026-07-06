import WeddingInvitation from "../components/WeddingInvitation";

const INVITATION_CODE = "9918d35f-4a2e-4735-bd73-bb6b5b141151";

export default function Home() {
  return <WeddingInvitation invitationCode={INVITATION_CODE} />;
}
