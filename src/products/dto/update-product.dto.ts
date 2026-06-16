import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsObject,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  title?: string;

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

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;
}
