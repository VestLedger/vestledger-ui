import { redirect } from "next/navigation";
import { ACCESS_ROUTE_PATHS } from "@/config/access-routes";

export default function VestaPage() {
  redirect(ACCESS_ROUTE_PATHS.appHome);
}
