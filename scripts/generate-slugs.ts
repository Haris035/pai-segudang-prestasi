import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function createSlug(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function main() {
    console.log("======================================");
    console.log(" GENERATE SLUG PRESTASI");
    console.log("======================================");

    const achievements =
        await prisma.achievement.findMany({
            where: {
                slug: null,
            },
            include: {
                student: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

    console.log(
        `Ditemukan ${achievements.length} prestasi tanpa slug.`
    );

    if (achievements.length === 0) {
        console.log(
            "Semua prestasi sudah memiliki slug."
        );
        return;
    }

    for (const achievement of achievements) {
        const baseSlug = createSlug(
            `${achievement.achievementName}-${achievement.student.name}`
        );

        let slug =
            baseSlug ||
            `prestasi-${achievement.id}`;

        let counter = 2;

        while (true) {
            const existing =
                await prisma.achievement.findUnique({
                    where: {
                        slug,
                    },
                    select: {
                        id: true,
                    },
                });

            if (
                !existing ||
                existing.id === achievement.id
            ) {
                break;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }

        await prisma.achievement.update({
            where: {
                id: achievement.id,
            },
            data: {
                slug,
            },
        });

        console.log(
            `✓ ${achievement.student.name}`
        );

        console.log(
            `  ${achievement.achievementName}`
        );

        console.log(
            `  → /prestasi/${slug}`
        );

        console.log("");
    }

    console.log("======================================");
    console.log(" SEMUA SLUG BERHASIL DIBUAT");
    console.log("======================================");
}

main()
    .catch((error) => {
        console.error(
            "GAGAL GENERATE SLUG:"
        );
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });