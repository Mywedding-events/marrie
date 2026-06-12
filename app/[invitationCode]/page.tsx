import WeddingInvitation from "../../components/WeddingInvitation";

export default async function InvitationCodePage({
  params,
}: {
  params: Promise<{ invitationCode: string }>;
}) {
  const { invitationCode } = await params;

  return <WeddingInvitation invitationCode={invitationCode} />;
}
