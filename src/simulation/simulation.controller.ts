import { Controller, Get, Post, Body, Param, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SimulationService } from './simulation.service';
import { StartSimulationDto } from './dto/simulation.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { StartSimulationSchema, StartSimulationInput } from '../common/schemas/validation.schemas';

@ApiTags('simulation')
@Controller('simulation')
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new attack simulation' })
  @ApiResponse({ status: 201, description: 'Simulation started successfully' })
  @UsePipes(new ZodValidationPipe(StartSimulationSchema))
  startSimulation(@Body() dto: StartSimulationInput) {
    return this.simulationService.startSimulation(dto);
  }

  @Post(':id/stop')
  @ApiOperation({ summary: 'Stop a running simulation' })
  @ApiResponse({ status: 200, description: 'Simulation stopped successfully' })
  stopSimulation(@Param('id') id: string) {
    return this.simulationService.stopSimulation(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get simulation details by ID' })
  @ApiResponse({ status: 200, description: 'Simulation details retrieved' })
  getSimulation(@Param('id') id: string) {
    return this.simulationService.getSimulation(id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all simulations' })
  @ApiResponse({ status: 200, description: 'Simulations list retrieved' })
  getAllSimulations() {
    return this.simulationService.getAllSimulations();
  }
}