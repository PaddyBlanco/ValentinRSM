import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faAddressBook,
  faBuilding,
  faCalendarDays,
  faHouse,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

export const mainNav: {
  href: string;
  label: string;
  mobileLabel: string;
  icon: IconDefinition;
}[] = [
  { href: "/", label: "Start", mobileLabel: "Start", icon: faHouse },
  { href: "/companies", label: "Firmen", mobileLabel: "Firmen", icon: faBuilding },
  { href: "/contacts", label: "Kontakte", mobileLabel: "Kontakte", icon: faAddressBook },
  { href: "/search", label: "Suche", mobileLabel: "Suche", icon: faMagnifyingGlass },
  {
    href: "/events",
    label: "Letzte Ereignisse",
    mobileLabel: "Ereignisse",
    icon: faCalendarDays,
  },
];
