import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { Alert, AlertTitle } from "@shared/components/atoms/alert";

export const AuthorizationResult = ({ result }: { result?: string }) => {
  if (!result) return null;
  if (result === "done") {
    return (
      <Alert className="mb-5 border-green-200 bg-green-500 text-white">
        <CheckIcon />
        <AlertTitle>Authorization done!</AlertTitle>
      </Alert>
    );
  }
  return (
    <Alert className="mb-5 border-amber-200 bg-amber-50 text-amber-900">
      <XIcon />
      <AlertTitle>Authorization failed!</AlertTitle>
    </Alert>
  );
};
