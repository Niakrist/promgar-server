import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

// Простейшая транслитерация: заменяем кириллицу на латиницу, убираем лишнее
function transliterate(text: string): string {
  if (!text) return '';
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'e',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'y',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'h',
    ц: 'c',
    ч: 'ch',
    ш: 'sh',
    щ: 'sch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
    ' ': '-',
    А: 'a',
    Б: 'b',
    В: 'v',
    Г: 'g',
    Д: 'd',
    Е: 'e',
    Ё: 'e',
    Ж: 'zh',
    З: 'z',
    И: 'i',
    Й: 'y',
    К: 'k',
    Л: 'l',
    М: 'm',
    Н: 'n',
    О: 'o',
    П: 'p',
    Р: 'r',
    С: 's',
    Т: 't',
    У: 'u',
    Ф: 'f',
    Х: 'h',
    Ц: 'c',
    Ч: 'ch',
    Ш: 'sh',
    Щ: 'sch',
    Ъ: '',
    Ы: 'y',
    Ь: '',
    Э: 'e',
    Ю: 'yu',
    Я: 'ya',
  };
  return text
    .split('')
    .map((char) => map[char] || char)
    .join('')
    .replace(/[^a-zA-Z0-9\-]/g, '')
    .replace(/\-+/g, '-')
    .toLowerCase();
}

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    // Убираем все undefined-поля, чтобы Prisma не ругалась
    const data = Object.fromEntries(
      Object.entries(createProductDto).filter(([_, v]) => v !== undefined),
    ) as Prisma.ProductCreateInput;
    const product = await this.prisma.product.create({ data });
    await this.generateUrls(product);
    return product;
  }

  async findAll(query: {
    category?: string;
    brand?: string;
    innerMin?: number;
    innerMax?: number;
    outerMin?: number;
    outerMax?: number;
    widthMin?: number;
    widthMax?: number;
    priceMin?: number;
    priceMax?: number;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.brand) where.brand = query.brand;
    if (query.innerMin || query.innerMax) {
      where.innerDiameterMm = {};
      if (query.innerMin) where.innerDiameterMm.gte = +query.innerMin;
      if (query.innerMax) where.innerDiameterMm.lte = +query.innerMax;
    }
    if (query.outerMin || query.outerMax) {
      where.outerDiameterMm = {};
      if (query.outerMin) where.outerDiameterMm.gte = +query.outerMin;
      if (query.outerMax) where.outerDiameterMm.lte = +query.outerMax;
    }
    if (query.widthMin || query.widthMax) {
      where.widthMm = {};
      if (query.widthMin) where.widthMm.gte = +query.widthMin;
      if (query.widthMax) where.widthMm.lte = +query.widthMax;
    }
    if (query.priceMin || query.priceMax) {
      where.price = {};
      if (query.priceMin) where.price.gte = +query.priceMin;
      if (query.priceMax) where.price.lte = +query.priceMax;
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: { urls: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { products, total, page, limit };
  }

  async findByPath(path: string) {
    // Точное совпадение URL
    const productUrl = await this.prisma.productUrl.findUnique({
      where: { path },
      include: { product: { include: { urls: true } } },
    });
    if (productUrl) {
      return productUrl.product;
    }
    return null;
  }

  async findCatalogByPath(path: string) {
    // Все товары, у которых URL начинается с path + '/'
    const prefix = path ? path + '/' : '';
    const urls = await this.prisma.productUrl.findMany({
      where: { path: { startsWith: prefix } },
      include: { product: { include: { urls: true } } },
      distinct: ['productId'],
    });
    return urls.map((u) => u.product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { urls: true },
    });
    if (!product) {
      throw new NotFoundException('Товар не найден');
    }
    return product;
  }

  async update(slug: string, updateProductDto: UpdateProductDto) {
    const product = await this.findBySlug(slug);
    const data = Object.fromEntries(
      Object.entries(updateProductDto).filter(([_, v]) => v !== undefined),
    );
    const updated = await this.prisma.product.update({
      where: { slug },
      data,
    });
    // Перегенерируем URL, если изменились характеристики или slug
    await this.prisma.productUrl.deleteMany({
      where: { productId: product.id },
    });
    await this.generateUrls(updated);
    return updated;
  }

  async remove(slug: string) {
    const product = await this.findBySlug(slug);
    await this.prisma.product.delete({ where: { slug } });
    return { deleted: true };
  }

  private async generateUrls(product: {
    id: number;
    slug: string;
    bodyRolling?: string | null;
    loadDirection?: string | null;
    rowCount?: string | null;
    bearingType?: string | null;
  }) {
    const attributes: string[] = [];
    if (product.bodyRolling)
      attributes.push(transliterate(product.bodyRolling));
    if (product.loadDirection)
      attributes.push(transliterate(product.loadDirection));
    if (product.rowCount) attributes.push(transliterate(product.rowCount));
    if (product.bearingType)
      attributes.push(transliterate(product.bearingType));

    // Генерация всех подпоследовательностей с сохранением порядка
    const n = attributes.length;
    const urls: string[] = [];
    for (let mask = 0; mask < 1 << n; mask++) {
      const segments: string[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) {
          segments.push(attributes[i]);
        }
      }
      const path =
        segments.join('/') + (segments.length ? '/' : '') + product.slug;
      urls.push(path);
    }

    const canonicalPath =
      attributes.join('/') + (attributes.length ? '/' : '') + product.slug;

    const data = urls.map((path) => ({
      path,
      isCanonical: path === canonicalPath,
      productId: product.id,
    }));

    await this.prisma.productUrl.createMany({ data, skipDuplicates: true });
  }

  private getAttributeMap(): Record<string, string> {
    return {
      sharikovye: 'шариковые',
      rolikovye: 'роликовые',
      igolchatye: 'игольчатые',
      radialnye: 'радиальные',
      'radialno-upornye': 'радиально-упорные',
      upornye: 'упорные',
      odnoryadnyy: 'однорядные',
      dvuhryadnyy: 'двухрядные',
      sfericheskie: 'сферические',
      konicheskie: 'конические',
      korpusnye: 'корпусные',
      sharnirnye: 'шарнирные',
    };
  }

  getCatalogMeta(path: string): {
    title: string;
    h1: string;
    description: string;
  } {
    const attrMap = this.getAttributeMap();
    const segments = path.split('/').filter(Boolean);

    const russianNames = segments.map((s) => attrMap[s] || s).filter(Boolean);

    const joined = russianNames.join(' ');

    return {
      title: `Купить ${joined} подшипники`,
      h1: joined
        ? joined.charAt(0).toUpperCase() + joined.slice(1)
        : 'Каталог подшипников',
      description: `Каталог ${joined} подшипников с доставкой по России.`,
    };
  }
}
