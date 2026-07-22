import privateJet from "@/assets/service-private-jet.jpg";
import airAmbulance from "@/assets/service-air-ambulance.jpg";
import helicopter from "@/assets/service-helicopter.jpg";
import groupCharter from "@/assets/service-group-charter.jpg";

export interface Service {
  slug: string;
  title: string;
  shortDesc: string;
  longDesc: string[];
  image: string;
}

export const services: Service[] = [
  {
    slug: "private-jet-service",
    title: "Private Jet Service",
    shortDesc:
      "Tailor-made private jet flights with full discretion, premium comfort and global reach. Choose from light, mid and heavy jets.",
    longDesc: [
      "Connection Aviation provides a seamless private jet charter experience built around your schedule, your comfort and your privacy. From light jets ideal for short regional hops to heavy long-range aircraft capable of intercontinental missions, our team curates every flight end-to-end.",
      "Our 24/7 charter desk negotiates the best aircraft and pricing across our global network of operators. Every aircraft we deploy is fully audited for safety, crew experience and cabin standard.",
      "From Kuwait to anywhere in the world — fly the way you deserve.",
    ],
    image: privateJet,
  },
  {
    slug: "group-chartering-service",
    title: "Group Chartering Service",
    shortDesc:
      "Move teams, sports squads or corporate delegations together. Capacity-built solutions for groups large and small.",
    longDesc: [
      "When the whole team needs to travel together, Connection Aviation arranges narrow-body and wide-body aircraft tailored to the size of your group. Sports teams, corporate delegations, government missions and tour operators trust us to keep everyone on the same flight path.",
      "We handle every detail — aircraft selection, crew, catering, ground handling, baggage and special equipment — so your delegation arrives rested and ready.",
    ],
    image: groupCharter,
  },
  {
    slug: "air-ambulance-service",
    title: "Air Ambulance Service",
    shortDesc:
      "24/7 medical evacuation flights with on-board ICU equipment and specialist crew, ensuring safe transfer of critical patients worldwide.",
    longDesc: [
      "Time matters in a medical emergency. Our air ambulance service is on standby 24 hours a day with fully-equipped ICU aircraft and experienced flight medical teams ready to depart on short notice.",
      "We coordinate directly with hospitals, insurers and ground ambulance providers to ensure a fully managed bed-to-bed transfer anywhere in the world.",
    ],
    image: airAmbulance,
  },
  {
    slug: "aircraft-management-service",
    title: "Aircraft Management Service",
    shortDesc:
      "Full-service aircraft management — operations, crew, maintenance, charter revenue and regulatory compliance under one roof.",
    longDesc: [
      "Owning an aircraft should feel like a privilege, not a burden. Our aircraft management service takes care of every operational detail: crew recruitment and training, maintenance planning, regulatory compliance, hangar arrangements, insurance and accounting.",
      "We can also place your aircraft on our charter fleet to offset ownership costs while protecting your priority access.",
    ],
    image: privateJet,
  },
  {
    slug: "aircraft-sell-and-purchase",
    title: "Aircraft Sell and Purchase",
    shortDesc:
      "Independent advisory for buying or selling business aircraft, from market research to closing.",
    longDesc: [
      "Whether you are acquiring your first aircraft or expanding a fleet, our advisory team supports you through market research, aircraft inspection, technical pre-purchase audits, contract negotiation and registration.",
      "On the sell side we position your aircraft to a qualified global buyer network and manage the transaction discreetly.",
    ],
    image: helicopter,
  },
  {
    slug: "cargo-charter-service",
    title: "Cargo Charter Service",
    shortDesc:
      "Time-critical and oversized cargo charter — from spare parts to humanitarian relief, anywhere on the globe.",
    longDesc: [
      "When freight cannot wait for a scheduled service, our cargo charter desk sources the right aircraft for the load — from small turboprops to heavy freighters such as the IL-76 and An-124.",
      "We handle dangerous goods, oversized industrial cargo, automotive, oil & gas and humanitarian relief missions with full customs and ground coordination.",
    ],
    image: groupCharter,
  },
];

export const getServiceBySlug = (slug?: string) =>
  services.find((s) => s.slug === slug);
