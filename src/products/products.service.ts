import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) { }

  // Словарь slug -> русское название для генерации мета-информации категорий
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

  getCatalogMeta(path: string): { title: string; h1: string; description: string } {
    const attrMap = this.getAttributeMap();
    const segments = path.split('/').filter(Boolean);
    const russianNames = segments.map(s => attrMap[s] || s).filter(Boolean);
    const joined = russianNames.join(' ');

    return {
      title: `Купить ${joined} подшипники`,
      h1: joined ? joined.charAt(0).toUpperCase() + joined.slice(1) : 'Каталог подшипников',
      description: `Каталог ${joined} подшипников с доставкой по России.`,
    };
  }

  async create(dto: CreateProductDto) {
    const data = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined)
    ) as Prisma.ProductCreateInput;
    const product = await this.prisma.product.create({ data });
    await this.generateUrls(product.id);
    return product;
  }

  async findAll(query: any) {
    const where: any = {};
    if (query.brandId) where.brandId = +query.brandId;
    if (query.rollingBodyId) where.rollingBodyId = +query.rollingBodyId;
    if (query.loadDirectionId) where.loadDirectionId = +query.loadDirectionId;
    if (query.rowCountId) where.rowCountId = +query.rowCountId;
    if (query.bearingTypeId) where.bearingTypeId = +query.bearingTypeId;

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
        include: { brand: true, rollingBody: true, loadDirection: true, rowCount: true, bearingType: true },
      }),
      this.prisma.product.count({ where }),
    ]);
    return { products, total, page, limit };
  }

  async findByPath(path: string) {
    const productUrl = await this.prisma.productUrl.findUnique({
      where: { path },
      include: { product: { include: { brand: true, rollingBody: true, loadDirection: true, rowCount: true, bearingType: true, urls: true } } },
    });
    return productUrl?.product ?? null;
  }

  async findCatalogByPath(path: string) {
    const prefix = path ? path + '/' : '';
    const urls = await this.prisma.productUrl.findMany({
      where: { path: { startsWith: prefix } },
      include: { product: { include: { brand: true, rollingBody: true, loadDirection: true, rowCount: true, bearingType: true } } },
      distinct: ['productId'],
    });
    return urls.map(u => u.product);
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { brand: true, rollingBody: true, loadDirection: true, rowCount: true, bearingType: true, urls: true },
    });
    if (!product) throw new NotFoundException('Товар не найден');
    return product;
  }

  async update(slug: string, dto: UpdateProductDto) {
    const product = await this.findBySlug(slug);
    const data = Object.fromEntries(
      Object.entries(dto).filter(([_, v]) => v !== undefined)
    ) as Prisma.ProductUpdateInput;
    const updated = await this.prisma.product.update({ where: { slug }, data });
    await this.prisma.productUrl.deleteMany({ where: { productId: product.id } });
    await this.generateUrls(updated.id);
    return updated;
  }

  async remove(slug: string) {
    await this.findBySlug(slug);
    await this.prisma.product.delete({ where: { slug } });
    return { deleted: true };
  }

  private async generateUrls(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { rollingBody: true, loadDirection: true, rowCount: true, bearingType: true },
    });
    if (!product) return;

    const segments: string[] = [];
    if (product.rollingBody) segments.push(product.rollingBody.slug);
    if (product.loadDirection) segments.push(product.loadDirection.slug);
    if (product.rowCount) segments.push(product.rowCount.slug);
    if (product.bearingType) segments.push(product.bearingType.slug);

    const n = segments.length;
    const urls: string[] = [];
    for (let mask = 0; mask < (1 << n); mask++) {
      const selected: string[] = [];
      for (let i = 0; i < n; i++) {
        if (mask & (1 << i)) selected.push(segments[i]);
      }
      const path = selected.join('/') + (selected.length ? '/' : '') + product.slug;
      urls.push(path);
    }
    const canonicalPath = segments.join('/') + (segments.length ? '/' : '') + product.slug;
    const data = urls.map(path => ({
      path,
      isCanonical: path === canonicalPath,
      productId: product.id,
    }));
    await this.prisma.productUrl.createMany({ data, skipDuplicates: true });
  }
}