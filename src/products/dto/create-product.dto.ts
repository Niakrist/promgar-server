import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MaxLength(255)
  slug!: string;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  content?: string;

  // Частые характеристики
 @IsOptional()
  @IsInt()
  brandId?: number;

  @IsOptional()
  @IsInt()
  rollingBodyId?: number;

  @IsOptional()
  @IsInt()
  loadDirectionId?: number;

  @IsOptional()
  @IsInt()
  rowCountId?: number;

  @IsOptional()
  @IsInt()
  bearingTypeId?: number;

  // Размеры
  @IsOptional()
  @IsNumber()
  innerDiameterMm?: number;

  @IsOptional()
  @IsNumber()
  outerDiameterMm?: number;

  @IsOptional()
  @IsNumber()
  widthMm?: number;

  //   @IsOptional()
  //   @IsNumber()
  //   weightKg?: number;

  //   @IsOptional()
  //   @IsString()
  //   factoryNumber?: string;

  //   @IsOptional()
  //   @IsString()
  //   accuracyClass?: string;

  // Остальные характеристики
  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
