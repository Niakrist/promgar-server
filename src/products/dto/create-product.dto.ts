import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
  Min,
  MaxLength,
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
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  bodyRolling?: string;

  @IsOptional()
  @IsString()
  loadDirection?: string;

  @IsOptional()
  @IsString()
  rowCount?: string;

  @IsOptional()
  @IsString()
  bearingType?: string;

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
