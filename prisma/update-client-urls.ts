import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const urlData: Record<string, { ig?: string; tt?: string; cont?: string; sop?: string }> = {
  'Ezequiel Jacobs': { ig: 'https://www.instagram.com/ezequiel.jacobs/', tt: 'https://www.tiktok.com/@ezequieljacobs255', cont: 'https://docs.google.com/spreadsheets/d/1AZPXGe2d8a8eCCIkmQ7DXG_PtzmlA8JmPWOm_OXy8Vg/edit?gid=373169112' },
  'Úrsula': { ig: 'https://www.instagram.com/ursula.bexiga/', tt: 'https://www.tiktok.com/@ursula.bexiga', cont: 'https://docs.google.com/spreadsheets/d/1ccGE58izDrptu4eFOYTLREZH64fGs75FVmQ1dU49T3w/edit?gid=373169112' },
  'Diana': { ig: 'https://www.instagram.com/dianaesquinas/', cont: 'https://docs.google.com/spreadsheets/d/1W5sSFrEKRbzEdHG6JccoJzGxXBfcqcMcrqGb46_DY_Q/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1hjvxgrhIkcCTImSAAs4gHOx-KqRwhgLFpr77DNsb7TI/edit?tab=t.0' },
  'Aleix': { ig: 'https://www.instagram.com/tufisiotemueve/', cont: 'https://docs.google.com/spreadsheets/d/1fTpmgVwSyAOQpvgtaZ0nhL9_0ldVaEoIdVqEVpj6Osk/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1PVPfibo_K-1RocI2Lh3pyyFEVvmmN_d84svKx64B9Ko/edit?tab=t.0' },
  'Rocio Blanco': { ig: 'https://www.instagram.com/rocioblancoimagen/', tt: 'https://www.tiktok.com/@rocioblancoimagen', cont: 'https://docs.google.com/spreadsheets/d/1_E_1N775UxcS1t4MV46-NDcH3UJir8THRLoBGxxiMmA/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1L3znFWys4eDQCN2KYuobywnKQPB4ZTriTPCdHO402BY/edit?usp=sharing' },
  'Alba': { ig: 'https://www.instagram.com/aclinicosteopatia/', tt: 'https://www.tiktok.com/@aclinicosteopatia', cont: 'https://docs.google.com/spreadsheets/d/1JiDh8DAyIwgPrnA64Irlg-slHRBs-j0geEkC3q8YRvY/edit?usp=sharing', sop: 'https://docs.google.com/document/d/1GVJhXRylGoQXxgBOWoikqb5rJRenLxS5nsIt1wq4Qqg/edit?tab=t.0' },
  'Alex Pastor': { ig: 'https://www.instagram.com/alex_pastor01/', tt: 'https://www.tiktok.com/@alex_pastor', cont: 'https://docs.google.com/spreadsheets/d/1OS4MJjAcXF59vJBzHtNJe4Dcl7mXP96y5WjIJCsghCY/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1mlL1hguPWobctnYsCO4nVMw_0N60j9ZRbw1RhxOss_g/edit?usp=sharing' },
  'Carmen': { ig: 'https://www.instagram.com/concienciaysalud/reels/', tt: 'https://www.tiktok.com/@concienciaysalud_nutri', cont: 'https://docs.google.com/spreadsheets/d/1qbCXkHy1raTaCqbi6IaYbN6Pku9kdzaASQFUljzwvQs/edit?gid=373169112' },
  'Farmacia Carmen': { ig: 'https://www.instagram.com/farmaciacarmenramirez/', tt: 'https://www.tiktok.com/@farmacarmenramirez', cont: 'https://docs.google.com/spreadsheets/d/1ZkbRCyGuTO7li2unXmAu2ofIDkNhe4vjWXZpPkV_-Sw/edit?gid=373169112', sop: 'https://docs.google.com/document/d/19RtpzEuSh5PQi8VsUo0gPQQ6SeFv_aDXQD760ru_CfA/edit?usp=sharing' },
  'Laura Fernandez': { ig: 'https://www.instagram.com/clinicalaurafernandez/', tt: 'https://www.tiktok.com/@clinicadentallaurafdez', cont: 'https://docs.google.com/spreadsheets/d/13jho2Jxi-7uckOJJI50_zDRlglKZrRQ4ODxuWQ2evs4/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1euT41hK1wgswr7tosGff0_ksN2l3vDU64xO1eg4HxvE/edit?tab=t.0' },
  'Uri Ecom': { ig: 'https://www.instagram.com/uri.horning/reels/', cont: 'https://docs.google.com/spreadsheets/d/1_4cdWRlWlkNaXsb-EKAWfbPgCNLGNbE6koUUzztgqgM/edit?gid=373169112' },
  'Sebas': { ig: 'https://www.instagram.com/soberanosdelvigor/', tt: 'https://www.tiktok.com/@soberanosdelvigor', cont: 'https://docs.google.com/spreadsheets/d/1zEGEThwf28EGpoBmV-m46wAhTOE3g9auu_R72kIdyKc/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1CSNykmwTv4jhMaPx0YtTOoCVVfMMiIqgdipUT0DU-pQ/edit?tab=t.0' },
  'Caro Rondon': { ig: 'https://www.instagram.com/macarolinarondon/', tt: 'https://www.tiktok.com/@macarolinarondon', cont: 'https://docs.google.com/spreadsheets/d/1saoXppIdwgg_J75GeF1uURDVeTa5bdYcezqtYGni3Z8/edit?usp=drive_link', sop: 'https://docs.google.com/document/d/1EvXsfGhvF0r4j2J_zvEVvfBph3FPNNP8euv7bOkR-fo/edit?tab=t.0' },
  'Marcel Acosta': { ig: 'https://www.instagram.com/marcel.acostag/', tt: 'https://www.tiktok.com/@marcelacosta.credito', cont: 'https://docs.google.com/spreadsheets/d/1qm6cqfvk6zPQoiBjxDDC28WpC1HYHFyg3ph3mTYKUbk/edit?gid=373169112', sop: 'https://docs.google.com/document/d/19t7e34YV0D-9KN7D29kr3Xhr9TYYI7crQRzN8R1CE0g/edit?tab=t.0' },
  'Ana Trenza': { ig: 'https://www.instagram.com/anatrenza/', tt: 'https://www.tiktok.com/@anatrenza', cont: 'https://docs.google.com/spreadsheets/d/1887YwfsX1CB8h3sUG0pJ7rt8ykTnAaLnF690MCOL-qE/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1ZjpxUcXU8QOeRpFzyqKTCubfQofGS9zn7MaE2gwhHMA/edit?usp=sharing' },
  'Alan Klein': { ig: 'https://www.instagram.com/reel/DRfm1tVgYey/', tt: 'https://www.tiktok.com/@alaanklein', cont: 'https://docs.google.com/spreadsheets/d/1wp2n_sYbqfhH7hnnIAVDBTZEZHfU0FeTXXWt5f_dc68/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1y-b-u9zzL1QQ5NKAJI0ZHyEBu5SVhQFaR5WVBbuhP4E/edit?usp=sharing' },
  'Frank Zimmermann': { ig: 'https://www.instagram.com/frankzimmermannrealtor/', tt: 'https://www.tiktok.com/@frankzimmermann.realtor', cont: 'https://docs.google.com/spreadsheets/d/1gyvufdxt8dPsesIMU37SM-bVT8i_xUKR3h6VATJIPAg/edit?usp=drive_link', sop: 'https://docs.google.com/document/d/1JQXltaAjWqYMchWmcRAqyriOTrvK2mUw9UnNtoxayKk/edit?tab=t.0' },
  'Claudia Rivero': { cont: 'https://docs.google.com/spreadsheets/d/1h9MlHaUvFwZ-hhrcPcE4goabU7liFVgCG9FThXsrMTk/edit?gid=373169112' },
  'Simone': { ig: 'https://www.instagram.com/rizzoandpartners/', tt: 'https://www.facebook.com/profile.php?id=61582117193472&sk=reels_tab', cont: 'https://docs.google.com/spreadsheets/d/18bva4K5qp3rf3B9qSzRx5rsRcoN9Bb3sUwFHkloQJnU/edit?gid=373169112', sop: 'https://docs.google.com/document/d/1DgY8wTlaMU2uFwRB8at8yG--UBBeYtHEvoPBzaOXeiY/edit?usp=sharing' },
  'Yeray Pastor': { ig: 'https://www.instagram.com/segurosmarti/', tt: 'https://www.tiktok.com/@aclinicosteopatia', cont: 'https://docs.google.com/spreadsheets/d/1HLSx9djSgwoZMOMK2yTTfjp0S332_kr7UtFfH35C6Ms/edit?usp=drive_link' },
  'Elsa': { cont: 'https://docs.google.com/spreadsheets/d/1jbk1SEJU19JNFVhbbWKnKBJWq0uDMvT5vPB-jLXEk9I/edit?gid=0' },
  'María': { ig: 'https://www.instagram.com/planlegado/', tt: 'https://www.tiktok.com/@planlegado', cont: 'https://docs.google.com/spreadsheets/d/1OoXxsvYqVu-VWusxo7MJ9gocBOkOSqs9COMhwnseKjA/edit?gid=373169112' },
  'Carlos Torrealba': { ig: 'https://www.instagram.com/cmtorrealba/', tt: 'https://www.tiktok.com/@cmtorrealba2', cont: 'https://docs.google.com/spreadsheets/d/1IYFpVHu2ytxBwfjHyqNOR6tVqr8r4oYEsV_mbutT5kA/edit?gid=373169112' },
  'Oscar edición': { cont: 'https://docs.google.com/spreadsheets/d/1ORHae-pZSjpgHz9MaVU-r4qVKk0tKT-EjV6T3ww2isI/edit?gid=373169112' },
  'Apple Kingdom': { ig: 'https://www.instagram.com/applekingdom_/', tt: 'https://www.tiktok.com/@apple.kingdom.ak', cont: 'https://docs.google.com/spreadsheets/d/1NKTLSGh8iP7TN1NWO0jW11XFnozlXIFjHY3tZoXog5I/edit?gid=373169112' },
  'Jara': { ig: 'https://www.instagram.com/jara.mkt/', tt: 'https://www.tiktok.com/@jara.mkt', cont: 'https://www.notion.so/Jara-Marketing-2a849af08a5f801488b4ce374e61bb1d' },
  'Stefy': { cont: 'https://drive.google.com/drive/folders/138aOerCJ7jxURDWDPtwdsXatgUGy_k0j?usp=drive_link' },
  'Sergio': { ig: 'https://www.instagram.com/gananciafitness/', tt: 'https://www.tiktok.com/@gananciafitness', cont: 'https://docs.google.com/spreadsheets/d/15DUY34eywc59TSeQsyFHLkLZDa3NeCSbtlhDRR4TA6g/edit?usp=sharing', sop: 'https://docs.google.com/document/d/14QExlg4gcSeDDN561r5BPfU8wk8KvDMsg5UQh0ULfcc/edit?usp=sharing' },
  'Benja Barrios': { ig: 'https://www.instagram.com/barrios.10/', tt: 'https://www.tiktok.com/@benjaminbarrios.10', cont: 'https://docs.google.com/spreadsheets/d/12PEEcnv0ttbcoXCq1jqL5XaS9dHJcyS848YfoWzqbZI/edit?gid=373169112' },
  'Gabriela Vila': { ig: 'https://www.instagram.com/finanzasnomadas/', tt: 'https://www.tiktok.com/@finanzasnomadas.gv', cont: 'https://docs.google.com/spreadsheets/d/1hUKzuUOAE8I_1Zuvw1UcxARIg-4COdbAPOfwSbGFu8w/edit?gid=373169112' },
  'Iking Store': { ig: 'https://www.instagram.com/iking.storee/', tt: 'https://www.tiktok.com/@iking.store', cont: 'https://docs.google.com/spreadsheets/d/1DvOhhWDxoUDNslkrX0rWl0teYhS3x84mWbJ57PrWzPA/edit?gid=373169112' },
  'Fit Canario': { ig: 'https://www.instagram.com/fitcanario/', tt: 'https://www.tiktok.com/@fitcanario9', cont: 'https://docs.google.com/spreadsheets/d/1PtL9SBkgBgb2_7JtREA-Y6khQKa4nXmquPgAVVHkoV0/edit?gid=373169112' },
  'Gaby Fruch': { ig: 'https://www.instagram.com/realtorgabyfruch/', tt: 'https://www.tiktok.com/@realtorgabyfruch', cont: 'https://docs.google.com/spreadsheets/d/1qIEGAoZwRgU1LBxiDcg_GAGRoaICsSpT_8vfoo5adIo/edit?gid=373169112' },
  'Santi Capotosti': { ig: 'https://www.instagram.com/santicapotosti.mkt/', tt: 'https://www.tiktok.com/@santino.capotosti', cont: 'https://docs.google.com/spreadsheets/d/1E5yPu7xblYatxL9Gk5-phVo7WIddZsMvzzZ39n503Ro/edit?gid=373169112' },
  'Mamen': { ig: 'https://www.instagram.com/mamen_delacruz/', tt: 'https://www.tiktok.com/@mamendelacruz' },
  'Joann': { ig: 'https://www.instagram.com/joannmadriz/', tt: 'https://www.tiktok.com/@madrizrealestate', cont: 'https://docs.google.com/spreadsheets/d/1cibeBb6yYx8SpDTe4HJFQ7WFJB4EYpIf5JN27otsdZo/edit' },
  'Ceci Bagley': { ig: 'https://www.instagram.com/cecibagley/', tt: 'https://www.tiktok.com/@ceci.bagley', cont: 'https://docs.google.com/spreadsheets/d/1_Xmy8ZgzWdSb9MyM_Q_cdv1KIgG6t_nMrw3lMBCeScU/edit?gid=373169112' },
}

async function main() {
  const clients = await prisma.client.findMany()
  console.log(`Actualizando URLs de ${clients.length} clientes...`)
  let updated = 0
  for (const client of clients) {
    const data = urlData[client.name]
    if (data) {
      await prisma.client.update({
        where: { id: client.id },
        data: {
          instagramUrl: data.ig ?? client.instagramUrl,
          tiktokUrl: data.tt ?? client.tiktokUrl,
          contentSheetUrl: data.cont ?? client.contentSheetUrl,
          scriptDocUrl: data.sop ?? client.scriptDocUrl,
        },
      })
      console.log(`✓ ${client.name}`)
      updated++
    } else {
      console.log(`- ${client.name} (sin datos)`)
    }
  }
  console.log(`\nListo: ${updated} clientes actualizados.`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
