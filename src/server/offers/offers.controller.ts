import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { CounterOfferDto } from './dto/counter-offer.dto';
import { CurrentUser, CurrentUserPayload } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List active and historic term sheet offers' })
  findAll() {
    return this.offersService.findAll();
  }

  @ApiBearerAuth()
  @Roles(Role.SHARK, Role.ADMIN)
  @Post()
  @ApiOperation({ summary: 'Submit a new bid or term sheet offer' })
  create(@CurrentUser() user: CurrentUserPayload, @Body() dto: CreateOfferDto) {
    return this.offersService.create(user, dto);
  }

  @ApiBearerAuth()
  @Post(':id/counter')
  @ApiOperation({ summary: 'Counter an existing offer' })
  counter(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string, @Body() dto: CounterOfferDto) {
    return this.offersService.counter(user, id, dto);
  }

  @ApiBearerAuth()
  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept an offer, closing the deal' })
  accept(@Param('id') id: string) {
    return this.offersService.accept(id);
  }

  @ApiBearerAuth()
  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reject an offer' })
  reject(@Param('id') id: string) {
    return this.offersService.reject(id);
  }

  @ApiBearerAuth()
  @Post(':id/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Withdraw a previously submitted offer' })
  withdraw(@CurrentUser() user: CurrentUserPayload, @Param('id') id: string) {
    return this.offersService.withdraw(user, id);
  }
}
